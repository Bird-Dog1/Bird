import Link from "next/link";
import { type Route } from "next";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { type Database } from "@/lib/supabase/database.types";

type VehicleStatus = Database["public"]["Enums"]["vehicle_status"];
type ApplicationStatus = Database["public"]["Enums"]["application_status"];

type PageHeaderProps = {
  title: string;
  description: string;
  actionHref?: Route | string;
  actionLabel?: string;
};

export function DealerPageHeader({
  title,
  description,
  actionHref,
  actionLabel,
}: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
          Dealer dashboard
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
        <p className="max-w-3xl text-sm text-muted-foreground">{description}</p>
      </div>
      {actionHref && actionLabel ? (
        <Button asChild className="w-full sm:w-auto">
          <Link href={actionHref as Route}>{actionLabel}</Link>
        </Button>
      ) : null}
    </div>
  );
}

export function StatusMessage({
  error,
  message,
}: {
  error?: string;
  message?: string;
}) {
  return (
    <>
      {error ? (
        <p className="rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-sm">
          {error}
        </p>
      ) : null}
      {message ? (
        <p className="rounded-xl border border-accent/40 bg-accent/10 p-3 text-sm text-accent">
          {message}
        </p>
      ) : null}
    </>
  );
}

export function EmptyState({
  title,
  description,
  actionHref,
  actionLabel,
}: PageHeaderProps) {
  return (
    <Card>
      <CardContent className="grid gap-4 p-8 text-center">
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">{title}</h2>
          <p className="mx-auto max-w-xl text-sm text-muted-foreground">{description}</p>
        </div>
        {actionHref && actionLabel ? (
          <Button asChild className="mx-auto w-full sm:w-auto">
            <Link href={actionHref as Route}>{actionLabel}</Link>
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}

export function ErrorState({ message }: { message: string }) {
  return (
    <Card className="border-destructive/50">
      <CardContent className="p-6 text-sm text-destructive">{message}</CardContent>
    </Card>
  );
}

export function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <Card>
      <CardHeader className="p-5">
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
      </CardHeader>
      <CardContent className="p-5 pt-0">
        <p className="text-3xl font-semibold">{value}</p>
        {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
      </CardContent>
    </Card>
  );
}

export function StatusBadge({
  status,
}: {
  status: VehicleStatus | ApplicationStatus | "active" | "ended";
}) {
  const className = {
    active: "border-accent/40 bg-accent/10 text-accent",
    approved: "border-accent/40 bg-accent/10 text-accent",
    available: "border-accent/40 bg-accent/10 text-accent",
    denied: "border-destructive/40 bg-destructive/10 text-destructive",
    ended: "border-border bg-secondary text-muted-foreground",
    pending: "border-primary/40 bg-primary/10 text-primary",
    rented: "border-primary/40 bg-primary/10 text-primary",
    submitted: "border-primary/40 bg-primary/10 text-primary",
    under_review: "border-primary/40 bg-primary/10 text-primary",
    unavailable: "border-border bg-secondary text-muted-foreground",
    cancelled: "border-border bg-secondary text-muted-foreground",
  }[status];

  return (
    <span
      className={cn(
        "inline-flex w-fit items-center rounded-full border px-2.5 py-1 text-xs font-semibold capitalize",
        className,
      )}
    >
      {status.replace("_", " ")}
    </span>
  );
}

export function Money({ value }: { value: number | string | null }) {
  const numberValue = typeof value === "string" ? Number(value) : value;

  if (numberValue === null || !Number.isFinite(numberValue)) {
    return <>$0.00</>;
  }

  return (
    <>
      {new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(numberValue)}
    </>
  );
}
