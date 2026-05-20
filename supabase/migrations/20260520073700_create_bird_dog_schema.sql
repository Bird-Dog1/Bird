create extension if not exists "pgcrypto";

create type public.user_role as enum ('customer', 'dealer', 'admin');
create type public.vehicle_status as enum ('available', 'pending', 'rented', 'unavailable');
create type public.application_status as enum ('submitted', 'under_review', 'approved', 'denied', 'cancelled');
create type public.document_type as enum ('license', 'insurance', 'other');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text,
  phone text,
  role public.user_role not null default 'customer',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.dealerships (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text,
  city text not null,
  state text not null,
  zip text,
  phone text,
  website text,
  approved boolean not null default false,
  suspended boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.dealer_users (
  id uuid primary key default gen_random_uuid(),
  dealership_id uuid not null references public.dealerships(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (dealership_id, user_id)
);

create table public.vehicles (
  id uuid primary key default gen_random_uuid(),
  dealership_id uuid not null references public.dealerships(id) on delete cascade,
  vin text not null unique,
  year integer not null check (year >= 1886),
  make text not null,
  model text not null,
  trim text,
  vehicle_type text,
  monthly_price numeric(10, 2) not null check (monthly_price >= 0),
  deposit numeric(10, 2) not null default 0 check (deposit >= 0),
  mileage_limit integer check (mileage_limit is null or mileage_limit > 0),
  city text not null,
  state text not null,
  rideshare_allowed boolean not null default false,
  insurance_required boolean not null default true,
  minimum_age integer not null default 21 check (minimum_age >= 0),
  status public.vehicle_status not null default 'available',
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.vehicle_photos (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid not null references public.vehicles(id) on delete cascade,
  photo_url text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (vehicle_id, sort_order)
);

create table public.rental_applications (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid not null references public.vehicles(id) on delete restrict,
  customer_id uuid not null references public.profiles(id) on delete cascade,
  dealership_id uuid not null references public.dealerships(id) on delete restrict,
  status public.application_status not null default 'submitted',
  customer_notes text,
  dealer_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.application_documents (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.rental_applications(id) on delete cascade,
  document_type public.document_type not null,
  file_url text not null,
  created_at timestamptz not null default now()
);

create table public.rentals (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid not null references public.vehicles(id) on delete restrict,
  customer_id uuid not null references public.profiles(id) on delete restrict,
  dealership_id uuid not null references public.dealerships(id) on delete restrict,
  application_id uuid references public.rental_applications(id) on delete set null,
  start_date date not null,
  end_date date,
  monthly_rate numeric(10, 2) not null check (monthly_rate >= 0),
  deposit numeric(10, 2) not null default 0 check (deposit >= 0),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (end_date is null or end_date >= start_date)
);

create index dealerships_public_listing_idx on public.dealerships (approved, suspended);
create index dealerships_location_idx on public.dealerships (state, city);
create index dealer_users_user_id_idx on public.dealer_users (user_id);
create index dealer_users_dealership_id_idx on public.dealer_users (dealership_id);
create index vehicles_dealership_status_idx on public.vehicles (dealership_id, status);
create index vehicles_public_search_idx on public.vehicles (status, state, city);
create index vehicles_make_model_idx on public.vehicles (make, model);
create index vehicle_photos_vehicle_sort_idx on public.vehicle_photos (vehicle_id, sort_order);
create index rental_applications_customer_status_idx on public.rental_applications (customer_id, status);
create index rental_applications_dealership_status_idx on public.rental_applications (dealership_id, status);
create index rental_applications_vehicle_id_idx on public.rental_applications (vehicle_id);
create index application_documents_application_id_idx on public.application_documents (application_id);
create index rentals_customer_active_idx on public.rentals (customer_id, active);
create index rentals_dealership_active_idx on public.rentals (dealership_id, active);
create index rentals_vehicle_active_idx on public.rentals (vehicle_id, active);
create index rentals_application_id_idx on public.rentals (application_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger set_dealerships_updated_at
before update on public.dealerships
for each row execute function public.set_updated_at();

create trigger set_vehicles_updated_at
before update on public.vehicles
for each row execute function public.set_updated_at();

create trigger set_vehicle_photos_updated_at
before update on public.vehicle_photos
for each row execute function public.set_updated_at();

create trigger set_rental_applications_updated_at
before update on public.rental_applications
for each row execute function public.set_updated_at();

create trigger set_rentals_updated_at
before update on public.rentals
for each row execute function public.set_updated_at();

create or replace function public.current_user_role()
returns public.user_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid()
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.current_user_role() = 'admin', false)
$$;

create or replace function public.user_has_dealership(p_dealership_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.dealer_users du
    where du.user_id = auth.uid()
      and du.dealership_id = p_dealership_id
  )
$$;

create or replace function public.can_access_dealership(p_dealership_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_admin() or public.user_has_dealership(p_dealership_id)
$$;

create or replace function public.is_dealership_public(p_dealership_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.dealerships d
    where d.id = p_dealership_id
      and d.approved = true
      and d.suspended = false
  )
$$;

create or replace function public.is_vehicle_public(p_vehicle_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.vehicles v
    join public.dealerships d on d.id = v.dealership_id
    where v.id = p_vehicle_id
      and v.status = 'available'
      and d.approved = true
      and d.suspended = false
  )
$$;

create or replace function public.can_manage_vehicle(p_vehicle_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_admin() or exists (
    select 1
    from public.vehicles v
    where v.id = p_vehicle_id
      and public.user_has_dealership(v.dealership_id)
  )
$$;

create or replace function public.can_access_application(p_application_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_admin() or exists (
    select 1
    from public.rental_applications ra
    where ra.id = p_application_id
      and (
        ra.customer_id = auth.uid()
        or public.user_has_dealership(ra.dealership_id)
      )
  )
$$;

create or replace function public.can_manage_application(p_application_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_admin() or exists (
    select 1
    from public.rental_applications ra
    where ra.id = p_application_id
      and public.user_has_dealership(ra.dealership_id)
  )
$$;

create or replace function public.prevent_profile_role_escalation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if old.role is distinct from new.role and not public.is_admin() then
    raise exception 'Only admins can change profile roles';
  end if;

  return new;
end;
$$;

create trigger prevent_profile_role_escalation
before update on public.profiles
for each row execute function public.prevent_profile_role_escalation();

create or replace function public.set_application_dealership()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  vehicle_dealership_id uuid;
begin
  select dealership_id into vehicle_dealership_id
  from public.vehicles
  where id = new.vehicle_id;

  if vehicle_dealership_id is null then
    raise exception 'Application vehicle does not exist';
  end if;

  new.dealership_id = vehicle_dealership_id;
  return new;
end;
$$;

create trigger set_application_dealership
before insert or update of vehicle_id on public.rental_applications
for each row execute function public.set_application_dealership();

create or replace function public.set_rental_dealership()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  vehicle_dealership_id uuid;
  application_record public.rental_applications%rowtype;
begin
  select dealership_id into vehicle_dealership_id
  from public.vehicles
  where id = new.vehicle_id;

  if vehicle_dealership_id is null then
    raise exception 'Rental vehicle does not exist';
  end if;

  new.dealership_id = vehicle_dealership_id;

  if new.application_id is not null then
    select * into application_record
    from public.rental_applications
    where id = new.application_id;

    if application_record.id is null then
      raise exception 'Rental application does not exist';
    end if;

    if application_record.vehicle_id <> new.vehicle_id
      or application_record.customer_id <> new.customer_id
      or application_record.dealership_id <> new.dealership_id then
      raise exception 'Rental must match its application vehicle, customer, and dealership';
    end if;
  end if;

  return new;
end;
$$;

create trigger set_rental_dealership
before insert or update of vehicle_id, customer_id, application_id on public.rentals
for each row execute function public.set_rental_dealership();

alter table public.profiles enable row level security;
alter table public.dealerships enable row level security;
alter table public.dealer_users enable row level security;
alter table public.vehicles enable row level security;
alter table public.vehicle_photos enable row level security;
alter table public.rental_applications enable row level security;
alter table public.application_documents enable row level security;
alter table public.rentals enable row level security;

create policy "profiles_select_own_or_admin"
on public.profiles for select
using (id = auth.uid() or public.is_admin());

create policy "profiles_insert_own_customer"
on public.profiles for insert
with check (id = auth.uid() and role = 'customer');

create policy "profiles_insert_admin"
on public.profiles for insert
with check (public.is_admin());

create policy "profiles_update_own_or_admin"
on public.profiles for update
using (id = auth.uid() or public.is_admin())
with check (id = auth.uid() or public.is_admin());

create policy "dealerships_select_public_dealer_or_admin"
on public.dealerships for select
using ((approved = true and suspended = false) or public.can_access_dealership(id));

create policy "dealerships_admin_insert"
on public.dealerships for insert
with check (public.is_admin());

create policy "dealerships_admin_update"
on public.dealerships for update
using (public.is_admin())
with check (public.is_admin());

create policy "dealerships_admin_delete"
on public.dealerships for delete
using (public.is_admin());

create policy "dealer_users_select_own_dealership_or_admin"
on public.dealer_users for select
using (public.can_access_dealership(dealership_id) or user_id = auth.uid());

create policy "dealer_users_admin_insert"
on public.dealer_users for insert
with check (public.is_admin());

create policy "dealer_users_admin_update"
on public.dealer_users for update
using (public.is_admin())
with check (public.is_admin());

create policy "dealer_users_admin_delete"
on public.dealer_users for delete
using (public.is_admin());

create policy "vehicles_select_public_available"
on public.vehicles for select
using (status = 'available' and public.is_dealership_public(dealership_id));

create policy "vehicles_select_dealer_or_admin"
on public.vehicles for select
using (public.can_access_dealership(dealership_id));

create policy "vehicles_insert_dealer_or_admin"
on public.vehicles for insert
with check (public.can_access_dealership(dealership_id));

create policy "vehicles_update_dealer_or_admin"
on public.vehicles for update
using (public.can_access_dealership(dealership_id))
with check (public.can_access_dealership(dealership_id));

create policy "vehicles_delete_dealer_or_admin"
on public.vehicles for delete
using (public.can_access_dealership(dealership_id));

create policy "vehicle_photos_select_public_vehicle"
on public.vehicle_photos for select
using (public.is_vehicle_public(vehicle_id));

create policy "vehicle_photos_select_dealer_or_admin"
on public.vehicle_photos for select
using (public.can_manage_vehicle(vehicle_id));

create policy "vehicle_photos_insert_dealer_or_admin"
on public.vehicle_photos for insert
with check (public.can_manage_vehicle(vehicle_id));

create policy "vehicle_photos_update_dealer_or_admin"
on public.vehicle_photos for update
using (public.can_manage_vehicle(vehicle_id))
with check (public.can_manage_vehicle(vehicle_id));

create policy "vehicle_photos_delete_dealer_or_admin"
on public.vehicle_photos for delete
using (public.can_manage_vehicle(vehicle_id));

create policy "rental_applications_select_customer"
on public.rental_applications for select
using (customer_id = auth.uid());

create policy "rental_applications_select_dealer_or_admin"
on public.rental_applications for select
using (public.can_access_dealership(dealership_id));

create policy "rental_applications_insert_customer"
on public.rental_applications for insert
with check (
  customer_id = auth.uid()
  and status = 'submitted'
  and public.is_vehicle_public(vehicle_id)
);

create policy "rental_applications_insert_dealer_or_admin"
on public.rental_applications for insert
with check (public.can_access_dealership(dealership_id));

create policy "rental_applications_update_dealer_or_admin"
on public.rental_applications for update
using (public.can_access_dealership(dealership_id))
with check (public.can_access_dealership(dealership_id));

create policy "rental_applications_delete_admin"
on public.rental_applications for delete
using (public.is_admin());

create policy "application_documents_select_customer"
on public.application_documents for select
using (public.can_access_application(application_id));

create policy "application_documents_insert_customer"
on public.application_documents for insert
with check (public.can_access_application(application_id));

create policy "application_documents_update_dealer_or_admin"
on public.application_documents for update
using (public.can_manage_application(application_id))
with check (public.can_manage_application(application_id));

create policy "application_documents_delete_dealer_or_admin"
on public.application_documents for delete
using (public.can_manage_application(application_id));

create policy "rentals_select_customer"
on public.rentals for select
using (customer_id = auth.uid());

create policy "rentals_select_dealer_or_admin"
on public.rentals for select
using (public.can_access_dealership(dealership_id));

create policy "rentals_insert_dealer_or_admin"
on public.rentals for insert
with check (public.can_access_dealership(dealership_id));

create policy "rentals_update_dealer_or_admin"
on public.rentals for update
using (public.can_access_dealership(dealership_id))
with check (public.can_access_dealership(dealership_id));

create policy "rentals_delete_admin"
on public.rentals for delete
using (public.is_admin());
