"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireRole } from "@/lib/auth/guards";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const allowedReturnPaths = [
  "/dashboard/admin",
  "/dashboard/admin/dealerships",
  "/dashboard/admin/dealerships/",
] as const;

export async function updateDealershipAdminStatus(formData: FormData) {
  await requireRole(["admin"]);
  const supabase = await createServerSupabaseClient();

  const dealershipId = String(formData.get("dealership_id") ?? "");
  const intent = String(formData.get("intent") ?? "");
  const returnTo = sanitizeReturnTo(String(formData.get("return_to") ?? ""));

  const statusUpdate =
    intent === "approve"
      ? { approved: true, suspended: false }
      : intent === "suspend"
        ? { suspended: true }
        : intent === "unsuspend"
          ? { suspended: false }
          : null;

  if (!dealershipId || !statusUpdate) {
    redirectWithMessage(returnTo, "error", "Invalid dealership status update.");
  }

  const { error } = await supabase
    .from("dealerships")
    .update(statusUpdate)
    .eq("id", dealershipId);

  if (error) {
    redirectWithMessage(returnTo, "error", error.message);
  }

  revalidatePath("/dashboard/admin");
  revalidatePath("/dashboard/admin/dealerships");
  revalidatePath(`/dashboard/admin/dealerships/${dealershipId}`);

  const message =
    intent === "approve"
      ? "Dealership approved."
      : intent === "suspend"
        ? "Dealership suspended."
        : "Dealership unsuspended.";

  redirectWithMessage(returnTo, "message", message);
}

function sanitizeReturnTo(returnTo: string) {
  if (
    allowedReturnPaths.some((path) =>
      path.endsWith("/") ? returnTo.startsWith(path) : returnTo === path,
    )
  ) {
    return returnTo;
  }

  return "/dashboard/admin/dealerships";
}

function redirectWithMessage(
  path: string,
  key: "error" | "message",
  message: string,
): never {
  redirect(`${path}?${key}=${encodeURIComponent(message)}`);
}
