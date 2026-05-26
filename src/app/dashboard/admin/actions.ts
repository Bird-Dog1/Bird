"use server";

import type { Route } from "next";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireRole } from "@/lib/auth/guards";
import { isPlatformAdminEmail } from "@/lib/auth/roles";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { AppRole } from "@/types/app";

const roles = ["customer", "dealer", "admin"] as const;

function formString(formData: FormData, name: string) {
  return String(formData.get(name) ?? "").trim();
}

export async function updateDealershipStatus(formData: FormData) {
  await requireRole(["admin"]);
  const supabase = await createServerSupabaseClient();
  const dealershipId = formString(formData, "dealership_id");
  const action = formString(formData, "action");
  const values = action === "approve" ? { approved: true, suspended: false } : action === "suspend" ? { suspended: true } : { suspended: false };
  const { error } = await supabase.from("dealerships").update(values).eq("id", dealershipId);
  if (error) redirect(`/dashboard/admin/dealerships/${dealershipId}?error=${encodeURIComponent(error.message)}` as Route);
  revalidatePath("/dashboard/admin/dealerships");
  redirect(`/dashboard/admin/dealerships/${dealershipId}?message=Dealership%20updated.` as Route);
}

export async function updateDealershipProfile(formData: FormData) {
  await requireRole(["admin"]);
  const supabase = await createServerSupabaseClient();
  const dealershipId = formString(formData, "dealership_id");
  const { error } = await supabase.from("dealerships").update({
    address: formString(formData, "address") || null,
    city: formString(formData, "city"),
    name: formString(formData, "name"),
    phone: formString(formData, "phone") || null,
    state: formString(formData, "state").toUpperCase(),
    website: formString(formData, "website") || null,
    zip: formString(formData, "zip") || null,
  }).eq("id", dealershipId);
  if (error) redirect(`/dashboard/admin/dealerships/${dealershipId}?error=${encodeURIComponent(error.message)}` as Route);
  revalidatePath("/dashboard/admin/dealerships");
  redirect(`/dashboard/admin/dealerships/${dealershipId}?message=Profile%20saved.` as Route);
}

export async function updateUserRole(formData: FormData) {
  await requireRole(["admin"]);
  const supabase = await createServerSupabaseClient();
  const userId = formString(formData, "user_id");
  const role = formString(formData, "role") as AppRole;
  if (!roles.includes(role)) redirect("/dashboard/admin/users?error=Invalid%20role." as Route);
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("email")
    .eq("id", userId)
    .single();
  if (profileError || !profile) redirect("/dashboard/admin/users?error=User%20not%20found." as Route);
  if (role === "admin" && !isPlatformAdminEmail(profile.email)) {
    redirect("/dashboard/admin/users?error=Only%20the%20platform%20owner%20can%20be%20admin." as Route);
  }
  const { error } = await supabase.from("profiles").update({ role }).eq("id", userId);
  if (error) redirect(`/dashboard/admin/users?error=${encodeURIComponent(error.message)}` as Route);
  revalidatePath("/dashboard/admin/users");
  redirect("/dashboard/admin/users?message=User%20updated." as Route);
}

export async function assignDealerUser(formData: FormData) {
  await requireRole(["admin"]);
  const supabase = await createServerSupabaseClient();
  const dealershipId = formString(formData, "dealership_id");
  const email = formString(formData, "email").toLowerCase();
  if (isPlatformAdminEmail(email)) {
    redirect(`/dashboard/admin/dealerships/${dealershipId}?error=${encodeURIComponent("Admin cannot be assigned as a dealer.")}` as Route);
  }
  const { data: profile, error: profileError } = await supabase.from("profiles").select("id").eq("email", email).single();
  if (profileError || !profile) redirect(`/dashboard/admin/dealerships/${dealershipId}?error=${encodeURIComponent("User not found.")}` as Route);
  const { error: roleError } = await supabase.from("profiles").update({ role: "dealer" }).eq("id", profile.id);
  if (roleError) redirect(`/dashboard/admin/dealerships/${dealershipId}?error=${encodeURIComponent(roleError.message)}` as Route);
  const { error } = await supabase.from("dealer_users").insert({ dealership_id: dealershipId, user_id: profile.id });
  if (error) redirect(`/dashboard/admin/dealerships/${dealershipId}?error=${encodeURIComponent(error.message)}` as Route);
  revalidatePath("/dashboard/admin/dealerships");
  redirect(`/dashboard/admin/dealerships/${dealershipId}?message=Dealer%20user%20assigned.` as Route);
}
