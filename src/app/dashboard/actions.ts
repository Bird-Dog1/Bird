"use server";

import { revalidatePath } from "next/cache";
import { type Route } from "next";
import { redirect } from "next/navigation";

import { requireRole } from "@/lib/auth/guards";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  todayIsoDate,
  vehicleStatuses,
} from "@/lib/dealer/dashboard";
import { vehiclePhotoPath } from "@/lib/supabase/queries";
import { type Database, type TablesUpdate } from "@/lib/supabase/database.types";

type Supabase = Awaited<ReturnType<typeof createServerSupabaseClient>>;
type VehicleStatus = Database["public"]["Enums"]["vehicle_status"];

export async function createCustomerApplication(formData: FormData) {
  const { user } = await requireRole(["customer", "admin"]);
  const supabase = await createServerSupabaseClient();

  const vehicleId = String(formData.get("vehicle_id") ?? "");
  const customerNotes = String(formData.get("customer_notes") ?? "");

  const { error } = await supabase.from("rental_applications").insert({
    vehicle_id: vehicleId,
    customer_id: user.id,
    customer_notes: customerNotes || null,
  });

  if (error) {
    redirect(`/dashboard/customer?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/dashboard/customer");
  redirect("/dashboard/customer?message=Application saved.");
}

export async function createDealerVehicle(formData: FormData) {
  const { profile, user } = await requireRole(["dealer", "admin"]);
  const supabase = await createServerSupabaseClient();
  const dealershipId = String(formData.get("dealership_id") ?? "");
  const redirectPath = "/dashboard/dealer/inventory/new";

  await assertDealershipAccess({
    dealershipId,
    profileRole: profile.role,
    supabase,
    userId: user.id,
    redirectPath,
  });

  const payload = vehiclePayloadFromForm(formData);
  const { error } = await supabase.from("vehicles").insert({
    ...payload,
    dealership_id: dealershipId,
  });

  if (error) {
    redirectWithError(redirectPath, error.message);
  }

  revalidateDealerPaths();
  redirect(
    `/dashboard/dealer/inventory?dealership=${encodeURIComponent(
      dealershipId,
    )}&message=Vehicle saved.`,
  );
}

export async function updateDealerVehicle(formData: FormData) {
  const { profile, user } = await requireRole(["dealer", "admin"]);
  const supabase = await createServerSupabaseClient();
  const vehicleId = String(formData.get("vehicle_id") ?? "");
  const dealershipId = String(formData.get("dealership_id") ?? "");
  const redirectPath = `/dashboard/dealer/inventory/${vehicleId}/edit` as Route;

  await assertVehicleAccess({
    profileRole: profile.role,
    redirectPath,
    supabase,
    userId: user.id,
    vehicleId,
  });
  await assertDealershipAccess({
    dealershipId,
    profileRole: profile.role,
    supabase,
    userId: user.id,
    redirectPath,
  });

  const { error } = await supabase
    .from("vehicles")
    .update({
      ...vehiclePayloadFromForm(formData),
      dealership_id: dealershipId,
    })
    .eq("id", vehicleId);

  if (error) {
    redirectWithError(redirectPath, error.message);
  }

  revalidateDealerPaths();
  redirect(`${redirectPath}?message=Vehicle updated.`);
}

export async function uploadDealerVehiclePhoto(formData: FormData) {
  const { profile, user } = await requireRole(["dealer", "admin"]);
  const supabase = await createServerSupabaseClient();
  const vehicleId = String(formData.get("vehicle_id") ?? "");
  const redirectPath = `/dashboard/dealer/inventory/${vehicleId}/edit` as Route;

  await assertVehicleAccess({
    profileRole: profile.role,
    redirectPath,
    supabase,
    userId: user.id,
    vehicleId,
  });

  const file = formData.get("photo");

  if (!(file instanceof File) || file.size === 0) {
    redirectWithError(redirectPath, "Choose a vehicle photo to upload.");
  }

  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
    redirectWithError(redirectPath, "Vehicle photos must be JPG, PNG, or WebP files.");
  }

  const path = vehiclePhotoPath(vehicleId, `${crypto.randomUUID()}-${file.name}`);
  const { error: uploadError } = await supabase.storage
    .from("vehicle-photos")
    .upload(path, file, { contentType: file.type, upsert: false });

  if (uploadError) {
    redirectWithError(redirectPath, uploadError.message);
  }

  const sortOrder = await nextPhotoSortOrder(supabase, vehicleId);
  const { error } = await supabase.from("vehicle_photos").insert({
    vehicle_id: vehicleId,
    photo_url: path,
    sort_order: sortOrder,
  });

  if (error) {
    redirectWithError(redirectPath, error.message);
  }

  revalidateDealerPaths();
  redirect(`${redirectPath}?message=Photo uploaded.`);
}

export async function approveDealerApplication(formData: FormData) {
  await updateDealerApplicationStatus(formData, "approved", "Application approved.");
}

export async function denyDealerApplication(formData: FormData) {
  await updateDealerApplicationStatus(formData, "denied", "Application denied.");
}

export async function convertDealerApplicationToRental(formData: FormData) {
  const { profile, user } = await requireRole(["dealer", "admin"]);
  const supabase = await createServerSupabaseClient();
  const applicationId = String(formData.get("application_id") ?? "");
  const startDate = String(formData.get("start_date") ?? "") || todayIsoDate();
  const redirectPath = `/dashboard/dealer/applications/${applicationId}` as Route;

  await assertApplicationAccess({
    applicationId,
    profileRole: profile.role,
    redirectPath,
    supabase,
    userId: user.id,
  });

  const { error } = await supabase.rpc("convert_approved_application_to_rental", {
    p_application_id: applicationId,
    p_start_date: startDate,
  });

  if (error) {
    redirectWithError(redirectPath, error.message);
  }

  revalidateDealerPaths();
  redirect(`${redirectPath}?message=Application converted to active rental.`);
}

export async function updateDealershipProfile(formData: FormData) {
  const { profile, user } = await requireRole(["dealer", "admin"]);
  const supabase = await createServerSupabaseClient();
  const dealershipId = String(formData.get("dealership_id") ?? "");
  const redirectPath = "/dashboard/dealer/settings";

  await assertDealershipAccess({
    dealershipId,
    profileRole: profile.role,
    supabase,
    userId: user.id,
    redirectPath,
  });

  const { error } = await supabase
    .from("dealerships")
    .update({
      name: String(formData.get("name") ?? ""),
      address: nullableString(formData.get("address")),
      city: String(formData.get("city") ?? ""),
      state: String(formData.get("state") ?? ""),
      zip: nullableString(formData.get("zip")),
      phone: nullableString(formData.get("phone")),
      website: nullableString(formData.get("website")),
    })
    .eq("id", dealershipId);

  if (error) {
    redirectWithError(redirectPath, error.message);
  }

  revalidateDealerPaths();
  redirect(
    `/dashboard/dealer/settings?dealership=${encodeURIComponent(
      dealershipId,
    )}&message=Dealership profile updated.`,
  );
}

async function updateDealerApplicationStatus(
  formData: FormData,
  status: "approved" | "denied",
  successMessage: string,
) {
  const { profile, user } = await requireRole(["dealer", "admin"]);
  const supabase = await createServerSupabaseClient();
  const applicationId = String(formData.get("application_id") ?? "");
  const redirectPath = `/dashboard/dealer/applications/${applicationId}` as Route;

  await assertApplicationAccess({
    applicationId,
    profileRole: profile.role,
    redirectPath,
    supabase,
    userId: user.id,
  });

  const { error } = await supabase
    .from("rental_applications")
    .update({
      status,
      dealer_notes: nullableString(formData.get("dealer_notes")),
    })
    .eq("id", applicationId);

  if (error) {
    redirectWithError(redirectPath, error.message);
  }

  revalidateDealerPaths();
  redirect(`${redirectPath}?message=${encodeURIComponent(successMessage)}`);
}

function vehiclePayloadFromForm(formData: FormData): TablesUpdate<"vehicles"> {
  const monthlyPrice = Number(formData.get("monthly_price"));
  const deposit = Number(formData.get("deposit"));
  const mileageLimit = Number(formData.get("mileage_limit"));
  const minimumAge = Number(formData.get("minimum_age"));
  const status = String(formData.get("status") ?? "available") as VehicleStatus;

  return {
    vin: String(formData.get("vin") ?? "").trim(),
    year: Number(formData.get("year")),
    make: String(formData.get("make") ?? "").trim(),
    model: String(formData.get("model") ?? "").trim(),
    trim: nullableString(formData.get("trim")),
    vehicle_type: nullableString(formData.get("vehicle_type")),
    monthly_price: Number.isFinite(monthlyPrice) ? monthlyPrice : 0,
    deposit: Number.isFinite(deposit) ? deposit : 0,
    mileage_limit: Number.isFinite(mileageLimit) && mileageLimit > 0 ? mileageLimit : null,
    city: String(formData.get("city") ?? "").trim(),
    state: String(formData.get("state") ?? "").trim().toUpperCase(),
    rideshare_allowed: formData.get("rideshare_allowed") === "on",
    insurance_required: formData.get("insurance_required") === "on",
    minimum_age: Number.isFinite(minimumAge) ? minimumAge : 21,
    status: vehicleStatuses.includes(status) ? status : "available",
    description: nullableString(formData.get("description")),
  };
}

async function assertDealershipAccess({
  dealershipId,
  profileRole,
  redirectPath,
  supabase,
  userId,
}: {
  dealershipId: string;
  profileRole: string;
  redirectPath: Route | string;
  supabase: Supabase;
  userId: string;
}) {
  if (!dealershipId) {
    redirectWithError(redirectPath, "Choose a dealership.");
  }

  if (profileRole === "admin") {
    return;
  }

  const { data, error } = await supabase
    .from("dealer_users")
    .select("id")
    .eq("dealership_id", dealershipId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !data) {
    redirectWithError(
      redirectPath,
      "You must be assigned to this dealership before making changes.",
    );
  }
}

async function assertVehicleAccess({
  profileRole,
  redirectPath,
  supabase,
  userId,
  vehicleId,
}: {
  profileRole: string;
  redirectPath: Route | string;
  supabase: Supabase;
  userId: string;
  vehicleId: string;
}) {
  const { data, error } = await supabase
    .from("vehicles")
    .select("id, dealership_id")
    .eq("id", vehicleId)
    .maybeSingle();

  if (error || !data) {
    redirectWithError(redirectPath, "Vehicle not found for your dealership.");
  }

  await assertDealershipAccess({
    dealershipId: data.dealership_id,
    profileRole,
    redirectPath,
    supabase,
    userId,
  });
}

async function assertApplicationAccess({
  applicationId,
  profileRole,
  redirectPath,
  supabase,
  userId,
}: {
  applicationId: string;
  profileRole: string;
  redirectPath: Route | string;
  supabase: Supabase;
  userId: string;
}) {
  const { data, error } = await supabase
    .from("rental_applications")
    .select("id, dealership_id")
    .eq("id", applicationId)
    .maybeSingle();

  if (error || !data) {
    redirectWithError(redirectPath, "Application not found for your dealership.");
  }

  await assertDealershipAccess({
    dealershipId: data.dealership_id,
    profileRole,
    redirectPath,
    supabase,
    userId,
  });
}

async function nextPhotoSortOrder(supabase: Supabase, vehicleId: string) {
  const { data } = await supabase
    .from("vehicle_photos")
    .select("sort_order")
    .eq("vehicle_id", vehicleId)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  return (data?.sort_order ?? -1) + 1;
}

function nullableString(value: FormDataEntryValue | null) {
  const normalized = String(value ?? "").trim();

  return normalized.length > 0 ? normalized : null;
}

function redirectWithError(path: Route | string, message: string): never {
  redirect(`${path}?error=${encodeURIComponent(message)}`);
}

function revalidateDealerPaths() {
  revalidatePath("/dashboard/dealer");
  revalidatePath("/dashboard/dealer/inventory");
  revalidatePath("/dashboard/dealer/applications");
  revalidatePath("/dashboard/dealer/rentals");
  revalidatePath("/dashboard/dealer/settings");
}
