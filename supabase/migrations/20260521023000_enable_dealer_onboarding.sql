create or replace function public.assert_dealer_cannot_toggle_dealership_flags()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.is_admin() then
    return new;
  end if;

  if old.approved is distinct from new.approved
    or old.suspended is distinct from new.suspended then
    raise exception 'Only admins can change dealership approval or suspension';
  end if;

  return new;
end;
$$;

create trigger assert_dealer_cannot_toggle_dealership_flags
before update on public.dealerships
for each row execute function public.assert_dealer_cannot_toggle_dealership_flags();

drop policy if exists "dealerships_admin_update" on public.dealerships;

create policy "dealerships_admin_or_assigned_dealer_update"
on public.dealerships for update
using (public.is_admin() or public.user_has_dealership(id))
with check (public.is_admin() or public.user_has_dealership(id));

create or replace function public.create_dealership_for_current_dealer(
  p_name text,
  p_address text,
  p_city text,
  p_state text,
  p_zip text,
  p_phone text,
  p_website text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  new_dealership_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  if coalesce(public.current_user_role() <> 'dealer', true)
    and not public.is_admin() then
    raise exception 'Only dealer users can create a dealership profile';
  end if;

  if exists (select 1 from public.dealer_users du where du.user_id = auth.uid()) then
    raise exception 'Dealer user is already assigned to a dealership';
  end if;

  insert into public.dealerships (name, address, city, state, zip, phone, website, approved, suspended)
  values (trim(p_name), nullif(trim(p_address), ''), trim(p_city), upper(trim(p_state)), nullif(trim(p_zip), ''), nullif(trim(p_phone), ''), nullif(trim(p_website), ''), false, false)
  returning id into new_dealership_id;

  insert into public.dealer_users (dealership_id, user_id) values (new_dealership_id, auth.uid());
  return new_dealership_id;
end;
$$;
