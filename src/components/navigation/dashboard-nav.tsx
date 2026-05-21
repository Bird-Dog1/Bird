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
    <aside className="rounded-3xl border border-border bg-card/70 p-4">
      <p className="mb-4 text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
        {roleLabels[role]}
      </p>
      <nav className="grid gap-2">
        <Link
          className="rounded-xl px-3 py-2 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground"
          href="/dashboard"
        >
          Overview
        </Link>
        {visibleLinks.map((link) => (
          <Link
            className="rounded-xl px-3 py-2 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground"
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
