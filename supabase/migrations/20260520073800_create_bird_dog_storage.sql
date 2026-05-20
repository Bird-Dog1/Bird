insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'vehicle-photos',
  'vehicle-photos',
  false,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set
  name = excluded.name,
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'application-documents',
  'application-documents',
  false,
  20971520,
  array['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
on conflict (id) do update
set
  name = excluded.name,
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create or replace function public.storage_path_first_uuid(p_path text)
returns uuid
language plpgsql
immutable
as $$
declare
  first_segment text;
begin
  first_segment = split_part(p_path, '/', 1);

  if first_segment !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then
    return null;
  end if;

  return first_segment::uuid;
exception
  when others then
    return null;
end;
$$;

create policy "vehicle_photos_storage_select_public_or_dealer"
on storage.objects for select
using (
  bucket_id = 'vehicle-photos'
  and (
    (
      public.is_vehicle_public(public.storage_path_first_uuid(name))
      and public.can_view_public_listings()
    )
    or public.can_manage_vehicle(public.storage_path_first_uuid(name))
  )
);

create policy "vehicle_photos_storage_insert_dealer_or_admin"
on storage.objects for insert
with check (
  bucket_id = 'vehicle-photos'
  and public.can_manage_vehicle(public.storage_path_first_uuid(name))
);

create policy "vehicle_photos_storage_update_dealer_or_admin"
on storage.objects for update
using (
  bucket_id = 'vehicle-photos'
  and public.can_manage_vehicle(public.storage_path_first_uuid(name))
)
with check (
  bucket_id = 'vehicle-photos'
  and public.can_manage_vehicle(public.storage_path_first_uuid(name))
);

create policy "vehicle_photos_storage_delete_dealer_or_admin"
on storage.objects for delete
using (
  bucket_id = 'vehicle-photos'
  and public.can_manage_vehicle(public.storage_path_first_uuid(name))
);

create policy "application_documents_storage_select_owner_dealer_or_admin"
on storage.objects for select
using (
  bucket_id = 'application-documents'
  and public.can_access_application(public.storage_path_first_uuid(name))
);

create policy "application_documents_storage_insert_owner_dealer_or_admin"
on storage.objects for insert
with check (
  bucket_id = 'application-documents'
  and auth.uid() is not null
  and public.can_access_application(public.storage_path_first_uuid(name))
);

create policy "application_documents_storage_update_dealer_or_admin"
on storage.objects for update
using (
  bucket_id = 'application-documents'
  and public.can_manage_application(public.storage_path_first_uuid(name))
)
with check (
  bucket_id = 'application-documents'
  and public.can_manage_application(public.storage_path_first_uuid(name))
);

create policy "application_documents_storage_delete_dealer_or_admin"
on storage.objects for delete
using (
  bucket_id = 'application-documents'
  and public.can_manage_application(public.storage_path_first_uuid(name))
);
