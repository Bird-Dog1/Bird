import Link from "next/link";
import { type Route } from "next";

import { roleLabels } from "@/lib/auth/roles";
import { type AppRole } from "@/types/app";

const dashboardLinks: Array<{
  href: Route;
  label: string;
  roles: AppRole[];
}> = [
  { href: "/dashboard/customer", label: "Customer home", roles: ["customer", "admin"] },
  { href: "/dashboard/customer/applications", label: "My applications", roles: ["customer", "admin"] },
  { href: "/dashboard/customer/rentals" as Route, label: "My rentals", roles: ["customer", "admin"] },
  { href: "/dashboard/dealer", label: "Dealer home", roles: ["dealer", "admin"] },
  { href: "/dashboard/dealer/inventory", label: "Inventory", roles: ["dealer", "admin"] },
  { href: "/dashboard/dealer/applications", label: "Applications", roles: ["dealer", "admin"] },
  { href: "/dashboard/dealer/rentals", label: "Active rentals", roles: ["dealer", "admin"] },
  { href: "/dashboard/dealer/settings", label: "Dealership settings", roles: ["dealer", "admin"] },
  { href: "/dashboard/admin", label: "Admin home", roles: ["admin"] },
  { href: "/dashboard/admin/dealerships", label: "Dealership approvals", roles: ["admin"] },
  { href: "/dashboard/admin/users", label: "Users", roles: ["admin"] },
  { href: "/dashboard/admin/vehicles", label: "All vehicles", roles: ["admin"] },
  { href: "/dashboard/admin/applications", label: "All applications", roles: ["admin"] },
  { href: "/dashboard/admin/rentals", label: "All rentals", roles: ["admin"] },
];

export function DashboardNav({ role }: { role: AppRole }) {
  const visibleLinks = dashboardLinks.filter((link) => link.roles.includes(role));

  return (
    <aside className="sticky top-24 h-fit rounded-[2rem] border border-white/10 bg-card/80 p-4 shadow-2xl shadow-black/25 backdrop-blur-xl">
      <p className="mb-4 px-3 text-xs font-semibold uppercase tracking-[0.32em] text-muted-foreground">
        {roleLabels[role]}
      </p>
      <nav className="grid gap-2">
        <Link
          className="rounded-2xl px-3 py-2.5 text-sm text-muted-foreground hover:bg-white/[0.07] hover:text-foreground"
          href="/dashboard"
        >
          Overview
        </Link>
        {visibleLinks.map((link) => (
          <Link
            className="rounded-2xl px-3 py-2.5 text-sm text-muted-foreground hover:bg-white/[0.07] hover:text-foreground"
            href={link.href}
            key={link.href}
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
