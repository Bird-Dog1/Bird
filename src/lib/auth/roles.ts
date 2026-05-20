import { type Route } from "next";

import { type AppRole } from "@/types/app";

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
