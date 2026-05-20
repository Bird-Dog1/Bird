do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'customer_applications'
      and policyname = 'Dealers can read applications for their vehicles'
  ) then
    create policy "Dealers can read applications for their vehicles"
    on public.customer_applications for select
    using (
      exists (
        select 1
        from public.dealer_vehicles
        where dealer_vehicles.id = customer_applications.vehicle_id
          and dealer_vehicles.dealer_id = auth.uid()
      )
    );
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'Dealers can read documents for their vehicle applications'
  ) then
    create policy "Dealers can read documents for their vehicle applications"
    on storage.objects for select
    using (
      bucket_id = 'vehicle-documents'
      and exists (
        select 1
        from public.customer_applications
        join public.dealer_vehicles
          on dealer_vehicles.id = customer_applications.vehicle_id
        where dealer_vehicles.dealer_id = auth.uid()
          and (
            customer_applications.driver_license_path = storage.objects.name
            or customer_applications.insurance_document_path = storage.objects.name
          )
      )
    );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'Users can delete their uploaded vehicle documents'
  ) then
    create policy "Users can delete their uploaded vehicle documents"
    on storage.objects for delete
    using (
      bucket_id = 'vehicle-documents'
      and auth.uid()::text = (storage.foldername(name))[1]
    );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'Dealers can delete their uploaded vehicle photos'
  ) then
    create policy "Dealers can delete their uploaded vehicle photos"
    on storage.objects for delete
    using (
      bucket_id = 'vehicle-photos'
      and auth.uid()::text = (storage.foldername(name))[1]
      and public.current_app_role() in ('dealer', 'admin')
    );
  end if;
end
$$;
