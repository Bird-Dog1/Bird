import "server-only";

import { notFound } from "next/navigation";

import { requireRole } from "@/lib/auth/guards";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { type Database, type Tables } from "@/lib/supabase/database.types";

export type DealerSupabase = Awaited<ReturnType<typeof createServerSupabaseClient>>;
export type Dealership = Tables<"dealerships">;
export type Vehicle = Tables<"vehicles"> & {
  vehicle_photos: Tables<"vehicle_photos">[];
};
export type DealerApplication = Tables<"rental_applications"> & {
  application_documents: Tables<"application_documents">[];
  vehicles: Pick<
    Tables<"vehicles">,
    "id" | "vin" | "year" | "make" | "model" | "trim" | "monthly_price" | "deposit"
  > | null;
};
export type DealerApplicationDetail = DealerApplication & {
  profiles: Pick<Tables<"profiles">, "id" | "email" | "full_name" | "phone"> | null;
};
export type DealerRental = Tables<"rentals"> & {
  vehicles: Pick<Tables<"vehicles">, "id" | "vin" | "year" | "make" | "model" | "trim"> | null;
  profiles: Pick<Tables<"profiles">, "id" | "email" | "full_name" | "phone"> | null;
};

export type DealerContext = {
  supabase: DealerSupabase;
  userId: string;
  dealerships: Dealership[];
  dealership: Dealership | null;
};

export async function getDealerContext(selectedDealershipId?: string): Promise<DealerContext> {
  const { user, profile } = await requireRole(["dealer", "admin"]);
  const supabase = await createServerSupabaseClient();
  const dealerships =
    profile.role === "admin"
      ? await listAdminDealerships(supabase)
      : await listAssignedDealerships(supabase, user.id);

  const dealership =
    dealerships.find((item) => item.id === selectedDealershipId) ?? dealerships[0] ?? null;

  return {
    supabase,
    userId: user.id,
    dealerships,
    dealership,
  };
}

export async function requireDealerVehicle(vehicleId: string) {
  await requireRole(["dealer", "admin"]);
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("vehicles")
    .select("*, vehicle_photos (id, vehicle_id, photo_url, sort_order, created_at, updated_at)")
    .eq("id", vehicleId)
    .maybeSingle();

  if (error || !data) {
    notFound();
  }

  return { supabase, vehicle: data as Vehicle };
}

export async function requireDealerApplication(applicationId: string) {
  await requireRole(["dealer", "admin"]);
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("rental_applications")
    .select(
      `
        *,
        vehicles (
          id,
          vin,
          year,
          make,
          model,
          trim,
          monthly_price,
          deposit
        ),
        profiles!rental_applications_customer_id_fkey (
          id,
          email,
          full_name,
          phone
        ),
        application_documents (
          id,
          application_id,
          document_type,
          file_url,
          created_at
        )
      `,
    )
    .eq("id", applicationId)
    .maybeSingle();

  if (error || !data) {
    notFound();
  }

  return { supabase, application: data as DealerApplicationDetail };
}

export async function listDealerVehiclesFor(dealershipId: string) {
  const supabase = await createServerSupabaseClient();

  return supabase
    .from("vehicles")
    .select("*, vehicle_photos (id, vehicle_id, photo_url, sort_order, created_at, updated_at)")
    .eq("dealership_id", dealershipId)
    .order("created_at", { ascending: false });
}

export async function listDealerApplicationsFor(dealershipId: string) {
  const supabase = await createServerSupabaseClient();

  return supabase
    .from("rental_applications")
    .select(
      `
        *,
        vehicles (
          id,
          vin,
          year,
          make,
          model,
          trim,
          monthly_price,
          deposit
        ),
        application_documents (
          id,
          application_id,
          document_type,
          file_url,
          created_at
        )
      `,
    )
    .eq("dealership_id", dealershipId)
    .order("created_at", { ascending: false });
}

export async function listDealerRentalsFor(dealershipId: string) {
  const supabase = await createServerSupabaseClient();

  return supabase
    .from("rentals")
    .select(
      `
        *,
        vehicles (
          id,
          vin,
          year,
          make,
          model,
          trim
        ),
        profiles!rentals_customer_id_fkey (
          id,
          email,
          full_name,
          phone
        )
      `,
    )
    .eq("dealership_id", dealershipId)
    .eq("active", true)
    .order("created_at", { ascending: false });
}

export async function createVehiclePhotoSignedUrls(
  supabase: DealerSupabase,
  photos: Tables<"vehicle_photos">[],
) {
  return Promise.all(
    photos
      .sort((a, b) => a.sort_order - b.sort_order)
      .map(async (photo) => ({
        ...photo,
        signedUrl: await createSignedUrl(supabase, "vehicle-photos", photo.photo_url),
      })),
  );
}

export async function createApplicationDocumentSignedUrls(
  supabase: DealerSupabase,
  documents: Tables<"application_documents">[],
) {
  return Promise.all(
    documents.map(async (document) => ({
      ...document,
      signedUrl: await createSignedUrl(
        supabase,
        "application-documents",
        document.file_url,
      ),
    })),
  );
}

export function dealershipQuery(dealership: Dealership | null) {
  return dealership ? `?dealership=${encodeURIComponent(dealership.id)}` : "";
}

async function createSignedUrl(
  supabase: DealerSupabase,
  bucket: "vehicle-photos" | "application-documents",
  path: string,
) {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, 60 * 60);

  if (error) {
    return null;
  }

  return data.signedUrl;
}

async function listAssignedDealerships(supabase: DealerSupabase, userId: string) {
  const { data, error } = await supabase
    .from("dealer_users")
    .select(
      `
        dealerships!inner (
          id,
          name,
          address,
          city,
          state,
          zip,
          phone,
          website,
          approved,
          suspended,
          created_at,
          updated_at
        )
      `,
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: true });

  if (error || !data) {
    return [];
  }

  return data.map((item) => item.dealerships).filter(Boolean) as Dealership[];
}

async function listAdminDealerships(supabase: DealerSupabase) {
  const { data, error } = await supabase
    .from("dealerships")
    .select("*")
    .order("created_at", { ascending: true });

  if (error || !data) {
    return [];
  }

  return data;
}

export function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

export const vehicleStatuses: Database["public"]["Enums"]["vehicle_status"][] = [
  "available",
  "pending",
  "rented",
  "unavailable",
];

export const applicationStatuses: Database["public"]["Enums"]["application_status"][] = [
  "submitted",
  "under_review",
  "approved",
  "denied",
  "cancelled",
];
