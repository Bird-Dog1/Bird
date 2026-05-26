create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and (
        p.role = 'admin'
        or lower(p.email) = 'sibbe.c.stoll@gmail.com'
      )
  )
  or exists (
    select 1
    from auth.users u
    where u.id = auth.uid()
      and lower(u.email) = 'sibbe.c.stoll@gmail.com'
  )
$$;

create or replace function public.can_view_public_listings()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select true
$$;

alter table public.profiles disable trigger prevent_profile_role_escalation;

update public.profiles
set role = 'customer'
where role = 'admin'
  and lower(email) <> 'sibbe.c.stoll@gmail.com';

update public.profiles
set role = 'admin'
where lower(email) = 'sibbe.c.stoll@gmail.com';

alter table public.profiles enable trigger prevent_profile_role_escalation;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  requested_role text := new.raw_user_meta_data ->> 'role';
  assigned_role public.user_role := 'customer';
begin
  if lower(new.email) = 'sibbe.c.stoll@gmail.com' then
    assigned_role := 'admin';
  elsif requested_role = 'dealer' then
    assigned_role := 'dealer';
  end if;

  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'full_name',
    assigned_role
  );

  return new;
end;
$$;

create or replace function public.prevent_profile_role_escalation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role = 'admin' and lower(new.email) <> 'sibbe.c.stoll@gmail.com' then
    raise exception 'Only the platform owner can have the admin role';
  end if;

  if old.role is distinct from new.role and not public.is_admin() then
    raise exception 'Only admins can change profile roles';
  end if;

  return new;
end;
$$;

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

  if coalesce(public.current_user_role() <> 'dealer', true) or public.is_admin() then
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
