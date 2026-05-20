import Link from "next/link";
import { type Route } from "next";

import { SubmitButton } from "@/components/forms/submit-button";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type AdminPageHeaderProps = {
  title: string;
  description: string;
  children?: React.ReactNode;
};

export function AdminPageHeader({
  title,
  description,
  children,
}: AdminPageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
          Admin
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
        <p className="max-w-3xl text-sm text-muted-foreground">{description}</p>
      </div>
      {children ? <div className="flex flex-wrap gap-2">{children}</div> : null}
    </div>
  );
}

type AdminSearchProps = {
  defaultValue?: string;
  placeholder: string;
};

export function AdminSearch({ defaultValue, placeholder }: AdminSearchProps) {
  return (
    <form className="flex flex-col gap-3 rounded-3xl border border-border bg-card/60 p-4 sm:flex-row">
      <Input
        aria-label="Search"
        defaultValue={defaultValue}
        name="q"
        placeholder={placeholder}
        type="search"
      />
      <Button type="submit">Search</Button>
      {defaultValue ? (
        <Button asChild type="button" variant="outline">
          <Link href="?">Clear</Link>
        </Button>
      ) : null}
    </form>
  );
}

type AdminAlertProps = {
  children: React.ReactNode;
  tone?: "error" | "success";
};

export function AdminAlert({ children, tone = "error" }: AdminAlertProps) {
  return (
    <p
      className={cn(
        "rounded-xl border p-3 text-sm",
        tone === "error"
          ? "border-destructive/40 bg-destructive/10"
          : "border-accent/40 bg-accent/10 text-accent",
      )}
    >
      {children}
    </p>
  );
}

type MetricCardProps = {
  label: string;
  value: number | string;
  description: string;
  href?: Route;
};

export function MetricCard({ label, value, description, href }: MetricCardProps) {
  const content = (
    <Card className="h-full transition hover:border-primary/60">
      <CardHeader>
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-4xl">{value}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );

  if (!href) {
    return content;
  }

  return (
    <Link className="block h-full" href={href}>
      {content}
    </Link>
  );
}

type AdminTableProps = {
  children: React.ReactNode;
  empty?: boolean;
  emptyMessage?: string;
};

export function AdminTable({ children, empty, emptyMessage }: AdminTableProps) {
  return (
    <div className="overflow-hidden rounded-3xl border border-border bg-card/60">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">{children}</table>
      </div>
      {empty ? (
        <div className="border-t border-border p-6 text-sm text-muted-foreground">
          {emptyMessage ?? "No records found."}
        </div>
      ) : null}
    </div>
  );
}

export function TableHead({ children }: { children: React.ReactNode }) {
  return (
    <thead className="border-b border-border bg-secondary/50 text-xs uppercase tracking-[0.2em] text-muted-foreground">
      {children}
    </thead>
  );
}

export function TableCell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <td className={cn("px-4 py-3 align-top", className)}>{children}</td>;
}

export function TableHeaderCell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <th className={cn("px-4 py-3 font-semibold", className)}>{children}</th>;
}

type StatusBadgeProps = {
  children: React.ReactNode;
  tone?: "default" | "success" | "warning" | "danger" | "muted";
};

export function StatusBadge({ children, tone = "default" }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold capitalize",
        tone === "success" && "border-accent/50 bg-accent/10 text-accent",
        tone === "warning" && "border-primary/50 bg-primary/10 text-primary",
        tone === "danger" && "border-destructive/50 bg-destructive/10 text-destructive",
        tone === "muted" && "border-border bg-secondary text-muted-foreground",
        tone === "default" && "border-border bg-background/40 text-foreground",
      )}
    >
      {children}
    </span>
  );
}

type DealershipActionFormProps = {
  action: (formData: FormData) => Promise<void>;
  dealershipId: string;
  intent: "approve" | "suspend" | "unsuspend";
  label: string;
  returnTo: string;
  variant?: "default" | "outline" | "secondary";
};

export function DealershipActionForm({
  action,
  dealershipId,
  intent,
  label,
  returnTo,
  variant = "outline",
}: DealershipActionFormProps) {
  return (
    <form action={action}>
      <input name="dealership_id" type="hidden" value={dealershipId} />
      <input name="intent" type="hidden" value={intent} />
      <input name="return_to" type="hidden" value={returnTo} />
      <SubmitButton pendingLabel="Saving..." size="sm" variant={variant}>
        {label}
      </SubmitButton>
    </form>
  );
}
