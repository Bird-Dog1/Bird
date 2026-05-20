create type public.app_role as enum ('customer', 'dealer', 'admin');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  role public.app_role not null default 'customer',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.customer_applications (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.profiles(id) on delete cascade,
  monthly_budget numeric(10, 2),
  primary_use text check (
    primary_use is null or primary_use in ('rideshare', 'personal', 'between_vehicles')
  ),
  transportation_needs text,
  status text not null default 'submitted' check (
    status in ('submitted', 'reviewing', 'approved', 'declined')
  ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.dealer_vehicles (
  id uuid primary key default gen_random_uuid(),
  dealer_id uuid not null references public.profiles(id) on delete cascade,
  vin text not null,
  year integer not null,
  make text not null,
  model text not null,
  inventory_type text not null check (
    inventory_type in (
      'aged_inventory',
      'punched_unit',
      'r_unit',
      'service_loaner',
      'extra_vehicle'
    )
  ),
  monthly_price numeric(10, 2),
  mileage integer,
  status text not null default 'draft' check (
    status in ('draft', 'available', 'rented', 'inactive')
  ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index dealer_vehicles_dealer_vin_key on public.dealer_vehicles (dealer_id, vin);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger customer_applications_set_updated_at
before update on public.customer_applications
for each row execute function public.set_updated_at();

create trigger dealer_vehicles_set_updated_at
before update on public.dealer_vehicles
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  requested_role text := new.raw_user_meta_data ->> 'role';
  assigned_role public.app_role := 'customer';
begin
  if requested_role = 'dealer' then
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

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.current_app_role()
returns public.app_role
language sql
security definer
stable
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

alter table public.profiles enable row level security;
alter table public.customer_applications enable row level security;
alter table public.dealer_vehicles enable row level security;

create policy "Profiles are visible to owners and admins"
on public.profiles for select
using (id = auth.uid() or public.current_app_role() = 'admin');

create policy "Users can update their profile"
on public.profiles for update
using (id = auth.uid())
with check (id = auth.uid());

create policy "Customers can create their applications"
on public.customer_applications for insert
with check (customer_id = auth.uid() and public.current_app_role() in ('customer', 'admin'));

create policy "Customers and admins can read applications"
on public.customer_applications for select
using (customer_id = auth.uid() or public.current_app_role() = 'admin');

create policy "Customers and admins can update applications"
on public.customer_applications for update
using (customer_id = auth.uid() or public.current_app_role() = 'admin')
with check (customer_id = auth.uid() or public.current_app_role() = 'admin');

create policy "Dealers can create vehicles"
on public.dealer_vehicles for insert
with check (dealer_id = auth.uid() and public.current_app_role() in ('dealer', 'admin'));

create policy "Authenticated users can read available vehicles"
on public.dealer_vehicles for select
using (status = 'available' or dealer_id = auth.uid() or public.current_app_role() = 'admin');

create policy "Dealers and admins can update vehicles"
on public.dealer_vehicles for update
using (dealer_id = auth.uid() or public.current_app_role() = 'admin')
with check (dealer_id = auth.uid() or public.current_app_role() = 'admin');

insert into storage.buckets (id, name, public)
values ('vehicle-documents', 'vehicle-documents', false)
on conflict (id) do nothing;

create policy "Users can upload their vehicle documents"
on storage.objects for insert
with check (
  bucket_id = 'vehicle-documents'
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "Users can read their vehicle documents"
on storage.objects for select
using (
  bucket_id = 'vehicle-documents'
  and (
    auth.uid()::text = (storage.foldername(name))[1]
    or public.current_app_role() = 'admin'
  )
);
