"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireRole } from "@/lib/auth/guards";
import { createServerSupabaseClient } from "@/lib/supabase/server";

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

  const { error } = await supabase.from("dealer_vehicles").insert({
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
    photo_urls: parsePhotoUrls(formData),
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
    redirect(`/dashboard/dealer?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/dashboard/dealer");
  redirect("/dashboard/dealer?message=Vehicle saved.");
}
