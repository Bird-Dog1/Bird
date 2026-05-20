"use server";

import { randomUUID } from "node:crypto";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireRole } from "@/lib/auth/guards";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const maxPhotoBytes = 10 * 1024 * 1024;

function nullableString(formData: FormData, key: string) {
  const value = String(formData.get(key) ?? "").trim();
  return value || null;
}

function nullableNumber(formData: FormData, key: string) {
  const value = Number(formData.get(key));
  return Number.isFinite(value) ? value : null;
}

function parsePhotoUrls(formData: FormData) {
  return String(formData.get("photo_urls") ?? "")
    .split(/[\n,]+/)
    .map((url) => url.trim())
    .filter((url) => /^https?:\/\//i.test(url));
}

function safeFileName(file: File) {
  const cleanName = file.name.replace(/[^a-z0-9._-]+/gi, "-").toLowerCase();
  return cleanName || "vehicle-photo";
}

function getPhotoFiles(formData: FormData) {
  return formData
    .getAll("vehicle_photos")
    .filter((value): value is File => value instanceof File && value.size > 0);
}

async function cleanupVehiclePhotos(
  supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>,
  paths: string[],
) {
  if (paths.length === 0) {
    return;
  }

  await supabase.storage.from("vehicle-photos").remove(paths);
}

async function uploadVehiclePhotos({
  files,
  supabase,
  userId,
  vehicleId,
}: {
  files: File[];
  supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>;
  userId: string;
  vehicleId: string;
}) {
  const urls: string[] = [];
  const paths: string[] = [];

  for (const file of files) {
    if (file.size > maxPhotoBytes) {
      return {
        error: "Vehicle photos must be under 10 MB each.",
        paths,
        urls,
      };
    }

    const path = `${userId}/${vehicleId}/${Date.now()}-${safeFileName(file)}`;
    const { error } = await supabase.storage
      .from("vehicle-photos")
      .upload(path, file, {
        contentType: file.type || undefined,
        upsert: false,
      });

    if (error) {
      return { error: error.message, paths, urls };
    }

    paths.push(path);
    urls.push(
      supabase.storage.from("vehicle-photos").getPublicUrl(path).data.publicUrl,
    );
  }

  return { error: null, paths, urls };
}

export async function createCustomerApplication(formData: FormData) {
  const { user } = await requireRole(["customer", "admin"]);
  const supabase = await createServerSupabaseClient();

  const monthlyBudget = Number(formData.get("monthly_budget"));
  const primaryUse = String(formData.get("primary_use") ?? "");
  const transportationNeeds = String(formData.get("transportation_needs") ?? "");

  const { error } = await supabase.from("customer_applications").insert({
    customer_id: user.id,
    monthly_budget: Number.isFinite(monthlyBudget) ? monthlyBudget : null,
    primary_use: primaryUse || null,
    transportation_needs: transportationNeeds || null,
  });

  if (error) {
    redirect(`/dashboard/customer?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/dashboard/customer");
  redirect("/dashboard/customer?message=Application saved.");
}

export async function createDealerVehicle(formData: FormData) {
  const { user } = await requireRole(["dealer", "admin"]);
  const supabase = await createServerSupabaseClient();
  const vehicleId = randomUUID();
  const photoUpload = await uploadVehiclePhotos({
    files: getPhotoFiles(formData),
    supabase,
    userId: user.id,
    vehicleId,
  });

  if (photoUpload.error) {
    await cleanupVehiclePhotos(supabase, photoUpload.paths);
    redirect(`/dashboard/dealer?error=${encodeURIComponent(photoUpload.error)}`);
  }

  const { error } = await supabase.from("dealer_vehicles").insert({
    id: vehicleId,
    dealer_id: user.id,
    vin: String(formData.get("vin") ?? ""),
    year: Number(formData.get("year")),
    make: String(formData.get("make") ?? ""),
    model: String(formData.get("model") ?? ""),
    inventory_type: String(formData.get("inventory_type") ?? ""),
    monthly_price: nullableNumber(formData, "monthly_price"),
    mileage: nullableNumber(formData, "mileage"),
    city: nullableString(formData, "city"),
    state: nullableString(formData, "state"),
    vehicle_type: nullableString(formData, "vehicle_type"),
    photo_urls: [...parsePhotoUrls(formData), ...photoUpload.urls],
    deposit_amount: nullableNumber(formData, "deposit_amount"),
    mileage_limit: nullableNumber(formData, "mileage_limit"),
    insurance_required: formData.get("insurance_required") === "true",
    minimum_age: Number(formData.get("minimum_age") ?? 21),
    rideshare_allowed: formData.get("rideshare_allowed") === "true",
    dealership_name: nullableString(formData, "dealership_name"),
    dealership_phone: nullableString(formData, "dealership_phone"),
    dealership_email: nullableString(formData, "dealership_email"),
    description: nullableString(formData, "description"),
    status: String(formData.get("status") ?? "draft"),
  });

  if (error) {
    await cleanupVehiclePhotos(supabase, photoUpload.paths);
    redirect(`/dashboard/dealer?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/dashboard/dealer");
  redirect("/dashboard/dealer?message=Vehicle saved.");
}
