export const appRoles = ["customer", "dealer", "admin"] as const;

export type AppRole = (typeof appRoles)[number];

export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  role: AppRole;
  created_at: string;
  updated_at: string;
};
