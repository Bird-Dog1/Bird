create policy "profiles_select_related_dealer_customers"
on public.profiles for select
using (
  exists (
    select 1
    from public.rental_applications ra
    where ra.customer_id = profiles.id
      and public.can_access_dealership(ra.dealership_id)
  )
  or exists (
    select 1
    from public.rentals r
    where r.customer_id = profiles.id
      and public.can_access_dealership(r.dealership_id)
  )
);

drop policy if exists "dealerships_admin_update" on public.dealerships;

create policy "dealerships_update_dealer_or_admin"
on public.dealerships for update
using (public.can_access_dealership(id))
with check (public.can_access_dealership(id));

create or replace function public.prevent_dealer_dealership_status_changes()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    if old.approved is distinct from new.approved
      or old.suspended is distinct from new.suspended then
      raise exception 'Only admins can change dealership approval or suspension status';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists prevent_dealer_dealership_status_changes on public.dealerships;

create trigger prevent_dealer_dealership_status_changes
before update on public.dealerships
for each row execute function public.prevent_dealer_dealership_status_changes();

create or replace function public.convert_approved_application_to_rental(
  p_application_id uuid,
  p_start_date date
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  application_record public.rental_applications%rowtype;
  vehicle_record public.vehicles%rowtype;
  rental_id uuid;
begin
  select *
  into application_record
  from public.rental_applications
  where id = p_application_id
  for update;

  if application_record.id is null then
    raise exception 'Application not found';
  end if;

  if not public.can_manage_application(p_application_id) then
    raise exception 'You cannot manage this application';
  end if;

  if application_record.status <> 'approved' then
    raise exception 'Only approved applications can be converted to rentals';
  end if;

  select *
  into vehicle_record
  from public.vehicles
  where id = application_record.vehicle_id
  for update;

  if vehicle_record.id is null then
    raise exception 'Application vehicle not found';
  end if;

  if exists (
    select 1
    from public.rentals r
    where r.vehicle_id = application_record.vehicle_id
      and r.active = true
  ) then
    raise exception 'This vehicle already has an active rental';
  end if;

  insert into public.rentals (
    vehicle_id,
    customer_id,
    dealership_id,
    application_id,
    start_date,
    monthly_rate,
    deposit,
    active
  )
  values (
    application_record.vehicle_id,
    application_record.customer_id,
    application_record.dealership_id,
    application_record.id,
    p_start_date,
    vehicle_record.monthly_price,
    vehicle_record.deposit,
    true
  )
  returning id into rental_id;

  update public.vehicles
  set status = 'rented'
  where id = application_record.vehicle_id;

  return rental_id;
end;
$$;

grant execute on function public.convert_approved_application_to_rental(uuid, date) to authenticated;
