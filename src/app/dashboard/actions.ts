"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireRole } from "@/lib/auth/guards";
import { createServerSupabaseClient } from "@/lib/supabase/server";

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
  const { user } = await requireRole(["dealer", "admin"]);
  const supabase = await createServerSupabaseClient();

  const monthlyPrice = Number(formData.get("monthly_price"));
  const deposit = Number(formData.get("deposit"));
  const mileageLimit = Number(formData.get("mileage_limit"));
  const dealershipId = String(formData.get("dealership_id") ?? "");

  const { data: dealerUser, error: dealerUserError } = await supabase
    .from("dealer_users")
    .select("dealership_id")
    .eq("dealership_id", dealershipId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (dealerUserError || !dealerUser) {
    redirect(
      `/dashboard/dealer?error=${encodeURIComponent(
        "You must be assigned to this dealership before adding vehicles.",
      )}`,
    );
  }

  const { error } = await supabase.from("vehicles").insert({
    dealership_id: dealershipId,
    vin: String(formData.get("vin") ?? ""),
    year: Number(formData.get("year")),
    make: String(formData.get("make") ?? ""),
    model: String(formData.get("model") ?? ""),
    vehicle_type: String(formData.get("vehicle_type") ?? "") || null,
    monthly_price: Number.isFinite(monthlyPrice) ? monthlyPrice : 0,
    deposit: Number.isFinite(deposit) ? deposit : 0,
    mileage_limit: Number.isFinite(mileageLimit) ? mileageLimit : null,
    city: String(formData.get("city") ?? ""),
    state: String(formData.get("state") ?? ""),
  });

  if (error) {
    redirect(`/dashboard/dealer?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/dashboard/dealer");
  redirect("/dashboard/dealer?message=Vehicle saved.");
}
