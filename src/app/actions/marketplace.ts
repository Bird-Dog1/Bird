"use server";

import type { Route } from "next";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireRole } from "@/lib/auth/guards";
import { createServerSupabaseClient } from "@/lib/supabase/server";

function formString(formData: FormData, name: string) {
  return String(formData.get(name) ?? "").trim();
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
  const notes = formString(formData, "customer_notes");
  const license = fileFromForm(formData, "license");
  const insurance = fileFromForm(formData, "insurance");
  const errorPath = `/vehicles/${vehicleId}/apply`;

  if (!vehicleId || !license || !insurance) {
    redirect(`${errorPath}?error=${encodeURIComponent("License and insurance uploads are required.")}` as Route);
  }

  const { data: application, error: applicationError } = await supabase
    .from("rental_applications")
    .insert({
      customer_id: user.id,
      customer_notes: notes || null,
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
