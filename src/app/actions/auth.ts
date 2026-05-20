"use server";

import { type Route } from "next";
import { redirect } from "next/navigation";

import { safeRedirectPath } from "@/lib/auth/redirects";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { appRoles, type AppRole } from "@/types/app";

function siteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}

function roleFromForm(formData: FormData): AppRole {
  const role = formData.get("role");

  if (typeof role === "string" && appRoles.includes(role as AppRole)) {
    return role as AppRole;
  }

  return "customer";
}

export async function signIn(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const next = safeRedirectPath(formData.get("next"));
  const supabase = await createServerSupabaseClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    const params = new URLSearchParams({ error: error.message, next });
    redirect(`/login?${params.toString()}`);
  }

  redirect(next as Route);
}

export async function signUp(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const fullName = String(formData.get("full_name") ?? "");
  const role = roleFromForm(formData);
  const next = safeRedirectPath(formData.get("next"));
  const supabase = await createServerSupabaseClient();
  const callbackUrl = new URL("/auth/callback", siteUrl());
  callbackUrl.searchParams.set("next", next);

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: callbackUrl.toString(),
      data: {
        full_name: fullName,
        role,
      },
    },
  });

  if (error) {
    const params = new URLSearchParams({ error: error.message, next });
    redirect(`/signup?${params.toString()}`);
  }

  const params = new URLSearchParams({
    message: "Check your email to confirm your account.",
    next,
  });

  redirect(`/login?${params.toString()}`);
}

export async function signOut() {
  const supabase = await createServerSupabaseClient();

  await supabase.auth.signOut();
  redirect("/");
}
