"use server";

import { type Route } from "next";
import { redirect } from "next/navigation";

import { isMissingSupabaseEnvError } from "@/lib/env";
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
  const next = String(formData.get("next") ?? "/dashboard");
  const supabase = await getConfiguredSupabaseOrRedirect("/login");

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  redirect((next.startsWith("/") ? next : "/dashboard") as Route);
}

export async function signUp(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const fullName = String(formData.get("full_name") ?? "");
  const role = roleFromForm(formData);
  const supabase = await getConfiguredSupabaseOrRedirect("/signup");

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${siteUrl()}/auth/callback`,
      data: {
        full_name: fullName,
        role,
      },
    },
  });

  if (error) {
    redirect(`/signup?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/login?message=Check your email to confirm your account.");
}

export async function signOut() {
  const supabase = await getConfiguredSupabaseOrRedirect("/");

  await supabase.auth.signOut();
  redirect("/");
}

async function getConfiguredSupabaseOrRedirect(pathname: string) {
  try {
    return await createServerSupabaseClient();
  } catch (error) {
    if (isMissingSupabaseEnvError(error)) {
      redirect(
        `${pathname}?error=${encodeURIComponent(
          "Supabase environment variables are not configured.",
        )}` as Route,
      );
    }

    throw error;
  }
}
