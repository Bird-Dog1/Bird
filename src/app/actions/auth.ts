"use server";

import { redirect } from "next/navigation";

import { isMissingSupabaseEnvError } from "@/lib/env";
import { safeRedirectPath, routeWithParams } from "@/lib/redirects";
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
  const email = formValue(formData, "email").toLowerCase();
  const password = formValue(formData, "password");
  const next = safeRedirectPath(formData.get("next"));

  if (!isValidEmail(email) || password.length < 8) {
    redirect(
      routeWithParams("/login", {
        error: "Enter a valid email and password.",
        next,
      }),
    );
  }

  const supabase = await getConfiguredSupabaseOrRedirect("/login");

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    redirect(
      routeWithParams("/login", {
        error: "Invalid email or password.",
        next,
      }),
    );
  }

  redirect(next);
}

export async function signUp(formData: FormData) {
  const email = formValue(formData, "email").toLowerCase();
  const password = formValue(formData, "password");
  const fullName = formValue(formData, "full_name");
  const role = roleFromForm(formData);
  const next = safeRedirectPath(formData.get("next"));

  if (!fullName || !isValidEmail(email) || password.length < 8) {
    redirect(
      routeWithParams("/signup", {
        error: "Enter your name, a valid email, and a password with at least 8 characters.",
        next,
      }),
    );
  }

  const supabase = await getConfiguredSupabaseOrRedirect("/signup");

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${siteUrl()}/auth/callback?next=${encodeURIComponent(next)}`,
      data: {
        full_name: fullName,
        role,
      },
    },
  });

  if (error) {
    redirect(
      routeWithParams("/signup", {
        error: "Unable to create that account. Try a different email or sign in.",
        next,
      }),
    );
  }

  redirect(
    routeWithParams("/login", {
      message: "Check your email to confirm your account.",
      next,
    }),
  );
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
        routeWithParams(pathname as "/login" | "/signup" | "/", {
          error: "Supabase environment variables are not configured.",
        }),
      );
    }

    throw error;
  }
}

function formValue(formData: FormData, name: string) {
  const value = formData.get(name);

  return typeof value === "string" ? value.trim() : "";
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
