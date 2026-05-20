"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireRole } from "@/lib/auth/guards";
import { routeWithParams } from "@/lib/redirects";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function createCustomerApplication(formData: FormData) {
  const { user } = await requireRole(["customer", "admin"]);
  const supabase = await createServerSupabaseClient();

  const vehicleId = formValue(formData, "vehicle_id");
  const customerNotes = formValue(formData, "customer_notes");

  if (!isUuid(vehicleId)) {
    redirect(
      routeWithParams("/dashboard/customer", {
        error: "Choose an available vehicle before submitting an application.",
      }),
    );
  }

  const { data: vehicle, error: vehicleError } = await supabase
    .from("vehicles")
    .select("id, dealership_id")
    .eq("id", vehicleId)
    .eq("status", "available")
    .maybeSingle();

  if (vehicleError || !vehicle) {
    redirect(
      routeWithParams("/dashboard/customer", {
        error: "That vehicle is no longer available.",
      }),
    );
  }

  const { error } = await supabase.from("rental_applications").insert({
    vehicle_id: vehicle.id,
    customer_id: user.id,
    dealership_id: vehicle.dealership_id,
    status: "submitted",
    customer_notes: customerNotes || null,
  });

  if (error) {
    redirect(
      routeWithParams("/dashboard/customer", {
        error: "Unable to save the application. Please try again.",
      }),
    );
  }

  revalidatePath("/dashboard/customer");
  redirect(routeWithParams("/dashboard/customer", { message: "Application saved." }));
}

export async function createDealerVehicle(formData: FormData) {
  const { profile, user } = await requireRole(["dealer", "admin"]);
  const supabase = await createServerSupabaseClient();

  const dealershipId = formValue(formData, "dealership_id");
  const vin = formValue(formData, "vin").toUpperCase();
  const year = parseInteger(formData, "year");
  const make = formValue(formData, "make");
  const model = formValue(formData, "model");
  const city = formValue(formData, "city");
  const state = formValue(formData, "state").toUpperCase();
  const monthlyPrice = parseNumber(formData, "monthly_price");
  const deposit = parseNumber(formData, "deposit") ?? 0;
  const mileageLimit = parseInteger(formData, "mileage_limit");

  if (
    !isUuid(dealershipId) ||
    !vin ||
    !year ||
    year < 1886 ||
    !make ||
    !model ||
    !city ||
    state.length !== 2 ||
    monthlyPrice === null ||
    monthlyPrice < 0 ||
    deposit < 0 ||
    (mileageLimit !== null && mileageLimit <= 0)
  ) {
    redirect(
      routeWithParams("/dashboard/dealer", {
        error: "Check the required vehicle fields and try again.",
      }),
    );
  }

  const { data: dealership, error: dealershipError } = await supabase
    .from("dealerships")
    .select("id")
    .eq("id", dealershipId)
    .maybeSingle();

  if (dealershipError || !dealership) {
    redirect(
      routeWithParams("/dashboard/dealer", {
        error: "Choose a dealership you can manage.",
      }),
    );
  }

  if (profile.role !== "admin") {
    const { data: dealerUser, error: dealerUserError } = await supabase
      .from("dealer_users")
      .select("dealership_id")
      .eq("dealership_id", dealershipId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (dealerUserError || !dealerUser) {
      redirect(
        routeWithParams("/dashboard/dealer", {
          error: "You must be assigned to this dealership before adding vehicles.",
        }),
      );
    }
  }

  const { error } = await supabase.from("vehicles").insert({
    dealership_id: dealershipId,
    vin,
    year,
    make,
    model,
    vehicle_type: formValue(formData, "vehicle_type") || null,
    monthly_price: monthlyPrice,
    deposit,
    mileage_limit: mileageLimit,
    city,
    state,
  });

  if (error) {
    redirect(
      routeWithParams("/dashboard/dealer", {
        error: "Unable to save the vehicle. Check for a duplicate VIN and try again.",
      }),
    );
  }

  revalidatePath("/dashboard/dealer");
  redirect(routeWithParams("/dashboard/dealer", { message: "Vehicle saved." }));
}

function formValue(formData: FormData, name: string) {
  const value = formData.get(name);

  return typeof value === "string" ? value.trim() : "";
}

function parseNumber(formData: FormData, name: string) {
  const value = formValue(formData, name);

  if (!value) {
    return null;
  }

  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : null;
}

function parseInteger(formData: FormData, name: string) {
  const parsed = parseNumber(formData, name);

  return parsed !== null && Number.isInteger(parsed) ? parsed : null;
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}
