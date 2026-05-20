import { type Route } from "next";
import { redirect } from "next/navigation";

import { roleHome } from "@/lib/auth/roles";
import { getOptionalSupabaseEnv, isMissingSupabaseEnvError } from "@/lib/env";
import { routeWithParams } from "@/lib/redirects";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { appRoles, type AppRole } from "@/types/app";

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
    .select("id,email,full_name,role,created_at,updated_at")
    .eq("id", user.id)
    .single();
  const profile = data && appRoles.includes(data.role) ? data : null;

  if (error || !profile) {
    return null;
  }

  return { user, profile };
}

export async function requireUserProfile(nextPath: Route = "/dashboard") {
  if (!getOptionalSupabaseEnv()) {
    redirect(
      routeWithParams("/login", {
        error: "Supabase environment variables are not configured.",
        next: nextPath,
      }),
    );
  }

  const session = await getCurrentUserProfile();

  if (!session) {
    redirect(routeWithParams("/login", { next: nextPath }));
  }

  return session;
}

export async function requireRole(roles: AppRole[]) {
  const session = await requireUserProfile();

  if (!roles.includes(session.profile.role)) {
    redirect(roleHome[session.profile.role]);
  }

  return session;
}
