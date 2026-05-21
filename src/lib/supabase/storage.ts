import type { SupabaseClient } from "@supabase/supabase-js";

import type { PublicVehicle, VehiclePhoto } from "@/lib/bird-dog/types";
import type { Database } from "@/lib/supabase/database.types";

type StorageBucket = "vehicle-photos" | "application-documents";

export async function createSignedStorageUrl(
  supabase: SupabaseClient<Database>,
  bucket: StorageBucket,
  path: string | null,
) {
  if (!path) {
    return null;
  }

  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, 60 * 60);

  if (error) {
    return null;
  }

  return data.signedUrl;
}

export async function signVehiclePhotos(
  supabase: SupabaseClient<Database>,
  photos: VehiclePhoto[] | null | undefined,
) {
  return Promise.all(
    (photos ?? []).map(async (photo) => ({
      ...photo,
      signed_url: await createSignedStorageUrl(supabase, "vehicle-photos", photo.photo_url),
    })),
  );
}

export async function signPublicVehicles(
  supabase: SupabaseClient<Database>,
  vehicles: PublicVehicle[],
) {
  return Promise.all(
    vehicles.map(async (vehicle) => ({
      ...vehicle,
      vehicle_photos: await signVehiclePhotos(supabase, vehicle.vehicle_photos),
    })),
  );
}
