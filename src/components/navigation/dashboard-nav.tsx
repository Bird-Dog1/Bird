import Link from "next/link";
import { type Route } from "next";

import { roleLabels } from "@/lib/auth/roles";
import { cn } from "@/lib/utils";
import { type AppRole } from "@/types/app";

const dashboardLinks: Array<{
  href: Route;
  label: string;
  roles: AppRole[];
}> = [
  { href: "/dashboard/customer", label: "Customer workspace", roles: ["customer", "admin"] },
  { href: "/dashboard/dealer", label: "Dealer workspace", roles: ["dealer", "admin"] },
  { href: "/dashboard/admin", label: "Admin console", roles: ["admin"] },
];

type DashboardNavProps = {
  role: AppRole;
};

export function DashboardNav({ role }: DashboardNavProps) {
  const visibleLinks = dashboardLinks.filter((link) => link.roles.includes(role));

  return (
    <aside className="rounded-3xl border border-border bg-card/70 p-3 lg:p-4">
      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground lg:mb-4">
        {roleLabels[role]}
      </p>
      <nav className="flex gap-2 overflow-x-auto pb-1 lg:grid lg:overflow-visible lg:pb-0">
        <Link
          className="shrink-0 rounded-xl px-3 py-2 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground"
          href="/dashboard"
        >
          Overview
        </Link>
        {visibleLinks.map((link) => (
          <Link
            className={cn(
              "shrink-0 rounded-xl px-3 py-2 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground",
            )}
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
