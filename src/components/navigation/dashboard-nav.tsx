"use client";

import Link from "next/link";
import { type Route } from "next";
import { usePathname } from "next/navigation";

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
  const pathname = usePathname();
  const visibleLinks = dashboardLinks.filter((link) => link.roles.includes(role));

  return (
    <aside className="sticky top-24 h-fit rounded-[2rem] border border-white/10 bg-card/80 p-4 shadow-2xl shadow-black/25 backdrop-blur-xl">
      <p className="mb-4 px-3 text-xs font-semibold uppercase tracking-[0.32em] text-muted-foreground">
        {roleLabels[role]}
      </p>
      <nav className="flex gap-2 overflow-x-auto pb-1 lg:grid lg:overflow-visible lg:pb-0">
        <NavLink href="/dashboard" active={pathname === "/dashboard"} label="Overview" />
        {visibleLinks.map((link) => (
          <NavLink active={pathname === link.href || pathname.startsWith(`${link.href}/`)} href={link.href} key={link.href} label={link.label} />
        ))}
      </nav>
    </aside>
  );
}

function NavLink({ href, label, active }: { href: Route; label: string; active: boolean }) {
  return (
    <Link
      className={`shrink-0 rounded-2xl px-3 py-2.5 text-sm transition ${active ? "bg-white/[0.09] text-foreground shadow-inner shadow-black/20" : "text-muted-foreground hover:bg-white/[0.07] hover:text-foreground"}`}
      href={href}
    >
      {label}
    </Link>
  );
}
