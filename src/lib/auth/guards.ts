import { type Route } from "next";
import { redirect } from "next/navigation";

import { roleHome } from "@/lib/auth/roles";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { type AppRole, type Profile } from "@/types/app";

export async function getCurrentUserProfile() {
  const supabase = await createServerSupabaseClient();
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
  const profile = data as Profile | null;

  if (error || !profile) {
    return null;
  }

  return { user, profile };
}

export async function requireUserProfile(nextPath: Route = "/dashboard") {
  const session = await getCurrentUserProfile();

  if (!session) {
    redirect(`/login?next=${encodeURIComponent(nextPath)}` as Route);
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
