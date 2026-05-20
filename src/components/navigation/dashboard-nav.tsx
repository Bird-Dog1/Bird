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
            className={cn(
              "rounded-xl px-3 py-2 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground",
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
