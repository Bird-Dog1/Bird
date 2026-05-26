"use server";

import type { Route } from "next";
import { redirect } from "next/navigation";

import { requireRole } from "@/lib/auth/guards";
import { getPaymentSetupStatus } from "@/lib/payments/config";

function formString(formData: FormData, name: string) {
  return String(formData.get(name) ?? "").trim();
}

export async function startRentalCheckout(formData: FormData) {
  await requireRole(["customer"]);
  const rentalId = formString(formData, "rental_id");
  const redirectPath = "/dashboard/customer/rentals";
  const setup = getPaymentSetupStatus();

  if (!rentalId) {
    redirect(`${redirectPath}?error=${encodeURIComponent("Select an active rental before starting checkout.")}` as Route);
  }

  if (!setup.checkoutEnabled) {
    redirect(`${redirectPath}?error=${encodeURIComponent(setup.message)}` as Route);
  }

  redirect(`${redirectPath}?error=${encodeURIComponent("Stripe Checkout is not configured for this deployment.")}` as Route);
}
