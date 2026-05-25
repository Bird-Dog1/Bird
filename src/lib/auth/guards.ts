import { type Route } from "next";
import { redirect } from "next/navigation";

import { roleHome } from "@/lib/auth/roles";
import { isMissingSupabaseEnvError } from "@/lib/env";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { type AppRole, type Profile } from "@/types/app";

export async function getCurrentUserProfile() {
  let supabase;

  try {
    supabase = await createServerSupabaseClient();
  } catch (error) {
    if (isMissingSupabaseEnvError(error)) {
      return null;
    }

    throw error;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("id,email,full_name,phone,role,created_at,updated_at")
    .eq("id", user.id)
    .single();
  const profile = data as Profile | null;

  if (error || !profile) {
    return null;
  }

  return { user, profile };
}

export async function requireUserProfile(nextPath = "/dashboard") {
  const session = await getCurrentUserProfile();

  if (!session) {
    redirect(`/login?next=${encodeURIComponent(nextPath)}` as Route);
  }

  return session;
}

export async function requireRole(roles: AppRole[], nextPath = "/dashboard") {
  const session = await requireUserProfile(nextPath);

  if (!roles.includes(session.profile.role)) {
    redirect(roleHome[session.profile.role]);
  }

  return session;
}
