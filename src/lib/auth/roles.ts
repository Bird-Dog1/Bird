import { type Route } from "next";

import { type AppRole } from "@/types/app";

export const PLATFORM_ADMIN_EMAIL = "sibbe.c.stoll@gmail.com";

export const roleHome: Record<AppRole, Route> = {
  customer: "/dashboard/customer",
  dealer: "/dashboard/dealer",
  admin: "/dashboard/admin",
};

export const roleLabels: Record<AppRole, string> = {
  customer: "Customer",
  dealer: "Dealer",
  admin: "Admin",
};

type UserLike = {
  email?: string | null;
} | null | undefined;

type ProfileLike = {
  email?: string | null;
  role?: AppRole | null;
} | null | undefined;

export function isPlatformAdminEmail(email: string | null | undefined) {
  return email?.trim().toLowerCase() === PLATFORM_ADMIN_EMAIL;
}

export function isAdmin(userOrProfile: UserLike | ProfileLike, profile?: ProfileLike) {
  const candidateProfile = profile ?? userOrProfile;
  const candidateRole =
    candidateProfile && "role" in candidateProfile ? candidateProfile.role : null;

  return (
    isPlatformAdminEmail(userOrProfile?.email) ||
    isPlatformAdminEmail(candidateProfile?.email) ||
    candidateRole === "admin"
  );
}

export function isDealer(profile: ProfileLike) {
  return profile?.role === "dealer";
}

export function isCustomer(profile: ProfileLike) {
  return !profile || profile.role === "customer" || (!isDealer(profile) && profile.role !== "admin");
}

export function getEffectiveRole(user: UserLike, profile: ProfileLike): AppRole {
  if (isAdmin(user, profile)) return "admin";
  if (isDealer(profile)) return "dealer";
  return "customer";
}

export function canAccessRole(role: AppRole, user: UserLike, profile: ProfileLike) {
  return getEffectiveRole(user, profile) === role;
}
