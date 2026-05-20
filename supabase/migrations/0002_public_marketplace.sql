alter table public.dealer_vehicles
  add column if not exists city text,
  add column if not exists state text,
  add column if not exists vehicle_type text,
  add column if not exists photo_urls text[] not null default '{}',
  add column if not exists deposit_amount numeric(10, 2),
  add column if not exists mileage_limit integer,
  add column if not exists insurance_required boolean not null default true,
  add column if not exists minimum_age integer not null default 21,
  add column if not exists rideshare_allowed boolean not null default false,
  add column if not exists dealership_name text,
  add column if not exists dealership_phone text,
  add column if not exists dealership_email text,
  add column if not exists description text;

alter table public.customer_applications
  add column if not exists vehicle_id uuid references public.dealer_vehicles(id) on delete set null,
  add column if not exists driver_license_path text,
  add column if not exists insurance_document_path text,
  add column if not exists applicant_phone text,
  add column if not exists applicant_city text,
  add column if not exists applicant_state text,
  add column if not exists desired_start_date date,
  add column if not exists employment_status text,
  add column if not exists notes text;

create index if not exists dealer_vehicles_public_filters_idx
on public.dealer_vehicles (status, city, state, make, model, vehicle_type, rideshare_allowed);

create index if not exists customer_applications_customer_created_idx
on public.customer_applications (customer_id, created_at desc);

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'dealer_vehicles'
      and policyname = 'Public can read available vehicle listings'
  ) then
    create policy "Public can read available vehicle listings"
    on public.dealer_vehicles for select
    using (status = 'available');
  end if;
end
$$;

insert into storage.buckets (id, name, public)
values ('vehicle-photos', 'vehicle-photos', true)
on conflict (id) do nothing;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'Public can read vehicle photos'
  ) then
    create policy "Public can read vehicle photos"
    on storage.objects for select
    using (bucket_id = 'vehicle-photos');
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'Dealers can upload vehicle photos'
  ) then
    create policy "Dealers can upload vehicle photos"
    on storage.objects for insert
    with check (
      bucket_id = 'vehicle-photos'
      and public.current_app_role() in ('dealer', 'admin')
    );
  end if;
end
$$;
