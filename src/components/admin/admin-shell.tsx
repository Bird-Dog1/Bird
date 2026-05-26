"use client";

import {
  AlertTriangle,
  BarChart3,
  Building2,
  Car,
  CreditCard,
  FileCheck2,
  Flag,
  KeyRound,
  LucideIcon,
  Menu,
  Search,
  Settings,
  ShieldCheck,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Route } from "next";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";
import type { Profile } from "@/types/app";

type AdminNavItem = {
  href: Route;
  label: string;
  description: string;
  icon: LucideIcon;
};

export const adminNavItems: AdminNavItem[] = [
  {
    href: "/dashboard/admin",
    label: "Overview",
    description: "Platform pulse",
    icon: BarChart3,
  },
  {
    href: "/dashboard/admin/users",
    label: "Users",
    description: "Customers, dealers, admins",
    icon: Users,
  },
  {
    href: "/dashboard/admin/dealerships",
    label: "Dealerships",
    description: "Dealer accounts",
    icon: Building2,
  },
  {
    href: "/dashboard/admin/vehicles",
    label: "Inventory",
    description: "All vehicles",
    icon: Car,
  },
  {
    href: "/dashboard/admin/applications",
    label: "Applications",
    description: "Customer submissions",
    icon: FileCheck2,
  },
  {
    href: "/dashboard/admin/rentals",
    label: "Rentals",
    description: "Active and past",
    icon: KeyRound,
  },
  {
    href: "/dashboard/admin/payments",
    label: "Payments",
    description: "Payment records",
    icon: CreditCard,
  },
  {
    href: "/dashboard/admin/purchase-credit",
    label: "Purchase Credit",
    description: "Ownership path",
    icon: ShieldCheck,
  },
  {
    href: "/dashboard/admin/issues",
    label: "Issues / Flags",
    description: "Needs attention",
    icon: Flag,
  },
  {
    href: "/dashboard/admin/settings",
    label: "Settings",
    description: "Read-only policy notes",
    icon: Settings,
  },
];

export function AdminLayout({
  children,
  profile,
}: {
  children: ReactNode;
  profile: Pick<Profile, "email" | "full_name" | "role">;
}) {
  return (
    <main className="min-h-[calc(100vh-9rem)] bg-[radial-gradient(circle_at_top_left,rgb(255_255_255/0.08),transparent_30rem)]">
      <div className="mx-auto grid max-w-[96rem] gap-5 px-4 py-6 sm:px-6 lg:grid-cols-[19rem_1fr] lg:px-8">
        <AdminSidebar />
        <section className="min-w-0 space-y-5">
          <AdminHeader profile={profile} />
          {children}
        </section>
      </div>
    </main>
  );
}

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="lg:sticky lg:top-24 lg:h-[calc(100vh-7rem)]">
      <div className="rounded-[2rem] border border-white/10 bg-black/45 p-4 shadow-2xl shadow-black/35 backdrop-blur-2xl">
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.07]">
            <ShieldCheck className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-muted-foreground">
              Bird Dog
            </p>
            <p className="text-lg font-semibold tracking-[-0.04em]">Admin</p>
          </div>
        </div>
        <details className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-2 lg:hidden">
          <summary className="flex cursor-pointer list-none items-center justify-between px-3 py-2 text-sm font-semibold">
            Admin sections
            <Menu className="h-4 w-4" />
          </summary>
          <AdminNavList pathname={pathname} />
        </details>
        <div className="mt-5 hidden lg:block">
          <AdminNavList pathname={pathname} />
        </div>
      </div>
    </aside>
  );
}

function AdminNavList({ pathname }: { pathname: string }) {
  return (
    <nav className="grid gap-1.5">
      {adminNavItems.map((item) => {
        const Icon = item.icon;
        const active =
          pathname === item.href ||
          (item.href !== "/dashboard/admin" && pathname.startsWith(`${item.href}/`));

        return (
          <Link
            className={cn(
              "group flex items-center gap-3 rounded-2xl px-3 py-3 text-sm text-muted-foreground hover:bg-white/[0.07] hover:text-foreground",
              active && "border border-white/10 bg-white/[0.09] text-foreground shadow-lg shadow-black/20",
            )}
            href={item.href}
            key={item.href}
          >
            <span
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04]",
                active && "bg-primary text-primary-foreground",
              )}
            >
              <Icon className="h-4 w-4" />
            </span>
            <span>
              <span className="block font-semibold">{item.label}</span>
              <span className="block text-xs text-muted-foreground">{item.description}</span>
            </span>
          </Link>
        );
      })}
    </nav>
  );
}

function AdminHeader({
  profile,
}: {
  profile: Pick<Profile, "email" | "full_name" | "role">;
}) {
  return (
    <header className="rounded-[2rem] border border-white/10 bg-black/35 p-3 shadow-2xl shadow-black/25 backdrop-blur-2xl">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <form className="relative flex-1" role="search">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            className="h-12 w-full rounded-2xl border border-white/10 bg-white/[0.04] pl-11 pr-4 text-sm text-foreground shadow-inner shadow-black/20 placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
            name="q"
            placeholder="Search the current admin section"
          />
        </form>
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 lg:min-w-72">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">
              {profile.full_name ?? profile.email ?? "Admin"}
            </p>
            <p className="truncate text-xs text-muted-foreground">{profile.email}</p>
          </div>
          <span className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            {profile.role}
          </span>
        </div>
      </div>
    </header>
  );
}

export function AdminMetricCard({
  description,
  label,
  value,
}: {
  description?: string;
  label: string;
  value: ReactNode;
}) {
  return (
    <div className="rounded-[2rem] border border-white/10 bg-white/[0.045] p-5 shadow-xl shadow-black/20">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-3 text-3xl font-semibold tracking-[-0.05em]">{value}</p>
      {description ? <p className="mt-2 text-sm text-muted-foreground">{description}</p> : null}
    </div>
  );
}

export function AdminDataTable({
  columns,
  empty,
  rows,
}: {
  columns: string[];
  empty: ReactNode;
  rows: ReactNode[];
}) {
  if (rows.length === 0) {
    return <>{empty}</>;
  }

  return (
    <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-black/25 shadow-2xl shadow-black/25">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-white/10 text-left text-sm">
          <thead className="bg-white/[0.04] text-xs uppercase tracking-[0.2em] text-muted-foreground">
            <tr>
              {columns.map((column) => (
                <th className="whitespace-nowrap px-5 py-4 font-semibold" key={column}>
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {rows.map((row, index) => (
              <tr className="align-top transition hover:bg-white/[0.035]" key={index}>
                {row}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function AdminTableCell({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <td className={cn("whitespace-nowrap px-5 py-4", className)}>{children}</td>;
}

export function AdminStatusBadge({ value }: { value: string | null | undefined }) {
  const normalized = value ?? "not set";
  const tones: Record<string, string> = {
    active: "border-accent/35 bg-accent/10 text-accent",
    admin: "border-primary/35 bg-primary/10 text-primary",
    approved: "border-accent/35 bg-accent/10 text-accent",
    available: "border-accent/35 bg-accent/10 text-accent",
    customer: "border-white/15 bg-white/[0.06] text-foreground",
    dealer: "border-primary/35 bg-primary/10 text-primary",
    denied: "border-destructive/40 bg-destructive/10 text-destructive-foreground",
    failed: "border-destructive/40 bg-destructive/10 text-destructive-foreground",
    inactive: "border-white/10 bg-white/[0.05] text-muted-foreground",
    overdue: "border-destructive/40 bg-destructive/10 text-destructive-foreground",
    pending: "border-primary/35 bg-primary/10 text-primary",
    rented: "border-primary/35 bg-primary/10 text-primary",
    submitted: "border-primary/35 bg-primary/10 text-primary",
    suspended: "border-destructive/40 bg-destructive/10 text-destructive-foreground",
    unavailable: "border-white/10 bg-white/[0.05] text-muted-foreground",
    under_review: "border-primary/35 bg-primary/10 text-primary",
  };

  return (
    <span
      className={cn(
        "inline-flex rounded-full border px-3 py-1 text-xs font-semibold capitalize tracking-wide",
        tones[normalized] ?? "border-white/10 bg-white/[0.05] text-muted-foreground",
      )}
    >
      {normalized.replaceAll("_", " ")}
    </span>
  );
}

export function AdminEmptyState({
  description = "No records found yet.",
  title = "No records found yet.",
}: {
  description?: string;
  title?: string;
}) {
  return (
    <div className="rounded-[2rem] border border-dashed border-white/15 bg-white/[0.035] p-8 text-center shadow-xl shadow-black/20">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/[0.05]">
        <AlertTriangle className="h-5 w-5 text-muted-foreground" />
      </div>
      <h2 className="mt-5 text-2xl font-semibold tracking-[-0.03em]">{title}</h2>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
        {description}
      </p>
    </div>
  );
}

export function AdminLoadingState() {
  return (
    <div className="space-y-5">
      <div className="h-48 animate-pulse rounded-[2rem] border border-white/10 bg-white/[0.045]" />
      <div className="grid gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            className="h-32 animate-pulse rounded-[2rem] border border-white/10 bg-white/[0.045]"
            key={index}
          />
        ))}
      </div>
    </div>
  );
}

export function AdminPageHeader({
  children,
  description,
  eyebrow = "Platform admin",
  title,
}: {
  children?: ReactNode;
  description: string;
  eyebrow?: string;
  title: string;
}) {
  return (
    <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(135deg,rgb(255_255_255/0.095),rgb(255_255_255/0.025))] p-6 shadow-2xl shadow-black/30 sm:p-8">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-muted-foreground">
            {eyebrow}
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.06em] sm:text-5xl">
            {title}
          </h1>
          <p className="mt-3 max-w-3xl leading-7 text-muted-foreground">{description}</p>
        </div>
        {children}
      </div>
    </section>
  );
}
