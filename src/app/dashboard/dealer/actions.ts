"use server";

import type { Route } from "next";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireRole } from "@/lib/auth/guards";
import type { Enums } from "@/lib/supabase/database.types";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const vehicleStatuses = ["available", "pending", "rented", "unavailable"] as const;
const applicationStatuses = ["submitted", "under_review", "approved", "denied", "cancelled"] as const;

function formString(formData: FormData, name: string) {
  return String(formData.get(name) ?? "").trim();
}

function formNumber(formData: FormData, name: string, fallback = 0) {
  const value = Number(formData.get(name));
  return Number.isFinite(value) ? value : fallback;
}

function formBoolean(formData: FormData, name: string) {
  return formData.get(name) === "on" || formData.get(name) === "true";
}

function vehicleStatus(formData: FormData): Enums<"vehicle_status"> {
  const status = formString(formData, "status");
  return vehicleStatuses.includes(status as Enums<"vehicle_status">)
    ? (status as Enums<"vehicle_status">)
    : "unavailable";
}

function cleanFileName(file: File) {
  const cleanName = file.name.trim().replace(/[\/\\]+/g, "-").replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/^-+|-+$/g, "");
  return `${Date.now()}-${cleanName || "photo"}`;
}

function photosFromForm(formData: FormData) {
  return formData.getAll("photos").filter((value): value is File => value instanceof File && value.size > 0);
}

export async function saveDealershipSettings(formData: FormData) {
  await requireRole(["dealer"]);
  const supabase = await createServerSupabaseClient();
  const dealershipId = formString(formData, "dealership_id");
  const values = {
    address: formString(formData, "address") || null,
    city: formString(formData, "city"),
    name: formString(formData, "name"),
    phone: formString(formData, "phone") || null,
    state: formString(formData, "state").toUpperCase(),
    website: formString(formData, "website") || null,
    zip: formString(formData, "zip") || null,
  };

  if (!values.name || !values.city || !values.state) {
    redirect("/dashboard/dealer/settings?error=Name%2C%20city%2C%20and%20state%20are%20required." as Route);
  }

  if (dealershipId) {
    const { error } = await supabase.from("dealerships").update(values).eq("id", dealershipId);
    if (error) redirect(`/dashboard/dealer/settings?error=${encodeURIComponent(error.message)}` as Route);
  } else {
    const { error } = await supabase.rpc("create_dealership_for_current_dealer", {
      p_address: values.address ?? "",
      p_city: values.city,
      p_name: values.name,
      p_phone: values.phone ?? "",
      p_state: values.state,
      p_website: values.website ?? "",
      p_zip: values.zip ?? "",
    });
    if (error) redirect(`/dashboard/dealer/settings?error=${encodeURIComponent(error.message)}` as Route);
  }

  revalidatePath("/dashboard/dealer");
  redirect("/dashboard/dealer/settings?message=Dealership%20settings%20saved." as Route);
}

function vehicleValues(formData: FormData) {
  return {
    city: formString(formData, "city"),
    deposit: formNumber(formData, "deposit"),
    description: formString(formData, "description") || null,
    insurance_required: formBoolean(formData, "insurance_required"),
    make: formString(formData, "make"),
    mileage_limit: formNumber(formData, "mileage_limit") || null,
    minimum_age: formNumber(formData, "minimum_age", 21),
    model: formString(formData, "model"),
    monthly_price: formNumber(formData, "monthly_price"),
    rideshare_allowed: formBoolean(formData, "rideshare_allowed"),
    state: formString(formData, "state").toUpperCase(),
    status: vehicleStatus(formData),
    trim: formString(formData, "trim") || null,
    vehicle_type: formString(formData, "vehicle_type") || null,
    vin: formString(formData, "vin").toUpperCase(),
    year: formNumber(formData, "year"),
  };
}

export async function createVehicle(formData: FormData) {
  await requireRole(["dealer"]);
  const supabase = await createServerSupabaseClient();
  const dealershipId = formString(formData, "dealership_id");
  if (!dealershipId) redirect("/dashboard/dealer/inventory/new?error=Select%20a%20dealership%20first." as Route);

  const { data: vehicle, error } = await supabase.from("vehicles").insert({ ...vehicleValues(formData), dealership_id: dealershipId }).select("id").single();
  if (error || !vehicle) {
    redirect(`/dashboard/dealer/inventory/new?error=${encodeURIComponent(error?.message ?? "Vehicle could not be saved.")}` as Route);
  }

  await uploadVehiclePhotos(vehicle.id, formData);
  revalidatePath("/dashboard/dealer/inventory");
  redirect(`/dashboard/dealer/inventory/${vehicle.id}/edit?message=Vehicle%20saved.` as Route);
}

export async function updateVehicle(formData: FormData) {
  await requireRole(["dealer"]);
  const supabase = await createServerSupabaseClient();
  const vehicleId = formString(formData, "vehicle_id");
  const redirectPath = `/dashboard/dealer/inventory/${vehicleId}/edit`;
  const { error } = await supabase.from("vehicles").update(vehicleValues(formData)).eq("id", vehicleId);
  if (error) redirect(`${redirectPath}?error=${encodeURIComponent(error.message)}` as Route);

  await uploadVehiclePhotos(vehicleId, formData);
  revalidatePath("/dashboard/dealer/inventory");
  redirect(`${redirectPath}?message=Vehicle%20updated.` as Route);
}

export async function updateApplicationStatus(formData: FormData) {
  await requireRole(["dealer"]);
  const supabase = await createServerSupabaseClient();
  const applicationId = formString(formData, "application_id");
  const submittedStatus = formString(formData, "status");
  const status = applicationStatuses.includes(submittedStatus as Enums<"application_status">)
    ? (submittedStatus as Enums<"application_status">)
    : null;
  const dealerNotes = formString(formData, "dealer_notes") || null;
  if (!applicationId || !status) {
    redirect(`/dashboard/dealer/applications/${applicationId}?error=${encodeURIComponent("Choose a valid application status.")}` as Route);
  }
  const { error } = await supabase.from("rental_applications").update({ dealer_notes: dealerNotes, status }).eq("id", applicationId);
  if (error) redirect(`/dashboard/dealer/applications/${applicationId}?error=${encodeURIComponent(error.message)}` as Route);
  revalidatePath("/dashboard/dealer/applications");
  redirect(`/dashboard/dealer/applications/${applicationId}?message=Application%20updated.` as Route);
}

export async function convertApplicationToRental(formData: FormData) {
  await requireRole(["dealer"]);
  const supabase = await createServerSupabaseClient();
  const applicationId = formString(formData, "application_id");
  const { data: application, error: applicationError } = await supabase
    .from("rental_applications")
    .select("id, vehicle_id, customer_id, vehicles (monthly_price, deposit)")
    .eq("id", applicationId)
    .single();
  if (applicationError || !application) {
    redirect(`/dashboard/dealer/applications/${applicationId}?error=${encodeURIComponent(applicationError?.message ?? "Application not found.")}` as Route);
  }

  const vehicle = Array.isArray(application.vehicles) ? application.vehicles[0] : application.vehicles;
  const { error: rentalError } = await supabase.from("rentals").insert({
    application_id: application.id,
    customer_id: application.customer_id,
    deposit: formNumber(formData, "deposit", Number(vehicle?.deposit ?? 0)),
    end_date: formString(formData, "end_date") || null,
    monthly_rate: formNumber(formData, "monthly_rate", Number(vehicle?.monthly_price ?? 0)),
    start_date: formString(formData, "start_date"),
    vehicle_id: application.vehicle_id,
  });
  if (rentalError) redirect(`/dashboard/dealer/applications/${applicationId}?error=${encodeURIComponent(rentalError.message)}` as Route);

  await supabase.from("rental_applications").update({ status: "approved" }).eq("id", applicationId);
  await supabase.from("vehicles").update({ status: "rented" }).eq("id", application.vehicle_id);
  revalidatePath("/dashboard/dealer/rentals");
  redirect("/dashboard/dealer/rentals?message=Rental%20created." as Route);
}

async function uploadVehiclePhotos(vehicleId: string, formData: FormData) {
  const files = photosFromForm(formData);
  if (files.length === 0) return;

  const supabase = await createServerSupabaseClient();
  const { count } = await supabase.from("vehicle_photos").select("id", { count: "exact", head: true }).eq("vehicle_id", vehicleId);
  let sortOrder = count ?? 0;

  for (const file of files) {
    const path = `${vehicleId}/${cleanFileName(file)}`;
    const { error: uploadError } = await supabase.storage.from("vehicle-photos").upload(path, file, { upsert: false });
    if (uploadError) redirect(`/dashboard/dealer/inventory/${vehicleId}/edit?error=${encodeURIComponent(uploadError.message)}` as Route);
    const { error: photoError } = await supabase.from("vehicle_photos").insert({ photo_url: path, sort_order: sortOrder, vehicle_id: vehicleId });
    if (photoError) redirect(`/dashboard/dealer/inventory/${vehicleId}/edit?error=${encodeURIComponent(photoError.message)}` as Route);
    sortOrder += 1;
  }
}
