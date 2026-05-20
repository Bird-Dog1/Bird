"use server";

import { randomUUID } from "node:crypto";

import { type Route } from "next";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireRole } from "@/lib/auth/guards";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const maxDocumentBytes = 10 * 1024 * 1024;

function errorPath(vehicleId: string | null, message: string) {
  const params = new URLSearchParams({ error: message });

  if (vehicleId) {
    params.set("vehicle", vehicleId);
  }

  return `/apply?${params.toString()}` as Route;
}

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function getMoney(formData: FormData, key: string) {
  const value = Number(getString(formData, key));
  return Number.isFinite(value) ? value : null;
}

function getRequiredDocument(formData: FormData, key: string) {
  const value = formData.get(key);

  if (!(value instanceof File) || value.size === 0) {
    return null;
  }

  if (value.size > maxDocumentBytes) {
    return null;
  }

  return value;
}

function safeFileName(file: File) {
  const cleanName = file.name.replace(/[^a-z0-9._-]+/gi, "-").toLowerCase();
  return cleanName || "document";
}

async function uploadDocument({
  applicationId,
  file,
  label,
  userId,
}: {
  applicationId: string;
  file: File;
  label: string;
  userId: string;
}) {
  const supabase = await createServerSupabaseClient();
  const path = `${userId}/${applicationId}/${label}-${Date.now()}-${safeFileName(file)}`;
  const { error } = await supabase.storage
    .from("vehicle-documents")
    .upload(path, file, {
      contentType: file.type || undefined,
      upsert: false,
    });

  return { path, error };
}

export async function submitRentalApplication(formData: FormData) {
  const { user } = await requireRole(["customer", "admin"], "/apply");
  const supabase = await createServerSupabaseClient();
  const vehicleId = getString(formData, "vehicle_id");
  const primaryUse = getString(formData, "primary_use");
  const applicationId = randomUUID();
  const driverLicense = getRequiredDocument(formData, "driver_license");
  const proofOfInsurance = getRequiredDocument(formData, "proof_of_insurance");

  if (!driverLicense) {
    redirect(errorPath(vehicleId, "Upload a driver's license under 10 MB."));
  }

  if (!proofOfInsurance) {
    redirect(errorPath(vehicleId, "Upload proof of insurance under 10 MB."));
  }

  if (!primaryUse) {
    redirect(errorPath(vehicleId, "Choose your primary rental use."));
  }

  if (vehicleId) {
    const { data, error } = await supabase
      .from("dealer_vehicles")
      .select("id")
      .eq("id", vehicleId)
      .eq("status", "available")
      .maybeSingle();

    if (error || !data) {
      redirect(errorPath(null, "That vehicle is no longer available."));
    }
  }

  const licenseUpload = await uploadDocument({
    applicationId,
    file: driverLicense,
    label: "drivers-license",
    userId: user.id,
  });

  if (licenseUpload.error) {
    redirect(errorPath(vehicleId, licenseUpload.error.message));
  }

  const insuranceUpload = await uploadDocument({
    applicationId,
    file: proofOfInsurance,
    label: "proof-of-insurance",
    userId: user.id,
  });

  if (insuranceUpload.error) {
    redirect(errorPath(vehicleId, insuranceUpload.error.message));
  }

  const { error } = await supabase.from("customer_applications").insert({
    id: applicationId,
    customer_id: user.id,
    vehicle_id: vehicleId,
    monthly_budget: getMoney(formData, "monthly_budget"),
    primary_use: primaryUse,
    transportation_needs: getString(formData, "transportation_needs"),
    driver_license_path: licenseUpload.path,
    insurance_document_path: insuranceUpload.path,
    applicant_phone: getString(formData, "applicant_phone"),
    applicant_city: getString(formData, "applicant_city"),
    applicant_state: getString(formData, "applicant_state"),
    desired_start_date: getString(formData, "desired_start_date"),
    employment_status: getString(formData, "employment_status"),
    notes: getString(formData, "notes"),
  });

  if (error) {
    redirect(errorPath(vehicleId, error.message));
  }

  revalidatePath("/applications");
  redirect(`/applications/submitted?id=${applicationId}` as Route);
}
