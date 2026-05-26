"use server";

import type { Route } from "next";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireRole } from "@/lib/auth/guards";
import { createServerSupabaseClient } from "@/lib/supabase/server";

function formString(formData: FormData, name: string) {
  return String(formData.get(name) ?? "").trim();
}

function formNumberString(formData: FormData, name: string) {
  const value = formString(formData, name);
  const number = Number(value);

  return value && Number.isFinite(number) && number >= 0 ? value : "";
}

function fileFromForm(formData: FormData, name: string) {
  const value = formData.get(name);

  return value instanceof File && value.size > 0 ? value : null;
}

function storageFileName(file: File) {
  const cleanName = file.name
    .trim()
    .replace(/[\/\\]+/g, "-")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return `${Date.now()}-${cleanName || "document"}`;
}

export async function submitRentalApplication(formData: FormData) {
  const { user } = await requireRole(["customer", "admin"]);
  const supabase = await createServerSupabaseClient();
  const vehicleId = formString(formData, "vehicle_id");
  const fullName = formString(formData, "full_name");
  const email = formString(formData, "email");
  const phone = formString(formData, "phone");
  const licenseStatus = formString(formData, "license_status");
  const insuranceStatus = formString(formData, "insurance_status");
  const employmentStatus = formString(formData, "employment_status");
  const incomeSource = formString(formData, "income_source");
  const monthlyIncome = formNumberString(formData, "monthly_income");
  const preferredStartDate = formString(formData, "preferred_start_date");
  const notes = formString(formData, "customer_notes");
  const license = fileFromForm(formData, "license");
  const insurance = fileFromForm(formData, "insurance");
  const errorPath = `/vehicles/${vehicleId}/apply`;

  if (!vehicleId) {
    redirect("/vehicles?error=Select%20a%20vehicle%20before%20applying." as Route);
  }

  const missingRequiredFields = [
    fullName,
    email,
    phone,
    licenseStatus,
    insuranceStatus,
    employmentStatus,
    incomeSource,
    monthlyIncome,
    preferredStartDate,
  ].some((value) => !value);

  if (missingRequiredFields) {
    redirect(`${errorPath}?error=${encodeURIComponent("Complete all required application fields before submitting.")}` as Route);
  }

  if (!email.includes("@")) {
    redirect(`${errorPath}?error=${encodeURIComponent("Enter a valid email address.")}` as Route);
  }

  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      full_name: fullName,
      phone,
    })
    .eq("id", user.id);

  if (profileError) {
    redirect(`${errorPath}?error=${encodeURIComponent(profileError.message)}` as Route);
  }

  const customerNotes = formatApplicationNotes({
    email,
    employmentStatus,
    fullName,
    incomeSource,
    insuranceStatus,
    licenseStatus,
    monthlyIncome,
    notes,
    phone,
    preferredStartDate,
    vehicleId,
  });

  const { data: application, error: applicationError } = await supabase
    .from("rental_applications")
    .insert({
      customer_id: user.id,
      customer_notes: customerNotes,
      vehicle_id: vehicleId,
    })
    .select("id")
    .single();

  if (applicationError || !application) {
    redirect(`${errorPath}?error=${encodeURIComponent(applicationError?.message ?? "Application could not be created.")}` as Route);
  }

  for (const [documentType, file] of [
    ["license", license],
    ["insurance", insurance],
  ] as const) {
    if (!file) continue;

    const path = `${application.id}/${documentType}-${storageFileName(file)}`;
    const { error: uploadError } = await supabase.storage
      .from("application-documents")
      .upload(path, file, { upsert: false });

    if (uploadError) {
      redirect(`${errorPath}?error=${encodeURIComponent(uploadError.message)}` as Route);
    }

    const insertResponse = (await supabase.from("application_documents").insert({
      application_id: application.id,
      document_type: documentType,
      file_url: path,
    })) as { error: { message: string } | null };

    if (insertResponse.error) {
      redirect(`${errorPath}?error=${encodeURIComponent(insertResponse.error.message)}` as Route);
    }
  }

  revalidatePath("/dashboard/customer/applications");
  redirect(`/applications/submitted?id=${application.id}` as Route);
}

function formatApplicationNotes({
  email,
  employmentStatus,
  fullName,
  incomeSource,
  insuranceStatus,
  licenseStatus,
  monthlyIncome,
  notes,
  phone,
  preferredStartDate,
  vehicleId,
}: {
  email: string;
  employmentStatus: string;
  fullName: string;
  incomeSource: string;
  insuranceStatus: string;
  licenseStatus: string;
  monthlyIncome: string;
  notes: string;
  phone: string;
  preferredStartDate: string;
  vehicleId: string;
}) {
  const lines = [
    "Application details",
    `Full name: ${fullName}`,
    `Email: ${email}`,
    `Phone: ${phone}`,
    `Driver's license status: ${licenseStatus}`,
    `Insurance status: ${insuranceStatus}`,
    `Employment status: ${employmentStatus}`,
    `Employer or income source: ${incomeSource}`,
    `Estimated monthly income: $${monthlyIncome}`,
    `Preferred start date: ${preferredStartDate}`,
    `Selected vehicle ID: ${vehicleId}`,
  ];

  if (notes) {
    lines.push("", "Customer notes", notes);
  }

  return lines.join("\n");
}
