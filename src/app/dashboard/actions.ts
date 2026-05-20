"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireRole } from "@/lib/auth/guards";
import { createServerSupabaseClient } from "@/lib/supabase/server";

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

  const monthlyPrice = Number(formData.get("monthly_price"));
  const mileage = Number(formData.get("mileage"));

  const { error } = await supabase.from("dealer_vehicles").insert({
    dealer_id: user.id,
    vin: String(formData.get("vin") ?? ""),
    year: Number(formData.get("year")),
    make: String(formData.get("make") ?? ""),
    model: String(formData.get("model") ?? ""),
    inventory_type: String(formData.get("inventory_type") ?? ""),
    monthly_price: Number.isFinite(monthlyPrice) ? monthlyPrice : null,
    mileage: Number.isFinite(mileage) ? mileage : null,
  });

  if (error) {
    redirect(`/dashboard/dealer?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/dashboard/dealer");
  redirect("/dashboard/dealer?message=Vehicle saved.");
}
