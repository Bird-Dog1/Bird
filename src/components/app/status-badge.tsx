import { cn } from "@/lib/utils";

const tones = {
  approved: "border-accent/35 bg-accent/10 text-accent",
  available: "border-accent/35 bg-accent/10 text-accent",
  denied: "border-destructive/40 bg-destructive/10 text-destructive-foreground",
  late: "border-destructive/40 bg-destructive/10 text-destructive-foreground",
  pending: "border-primary/30 bg-primary/10 text-primary",
  paid: "border-accent/35 bg-accent/10 text-accent",
  rented: "border-primary/30 bg-primary/10 text-primary",
  "setup required": "border-white/10 bg-white/[0.05] text-muted-foreground",
  submitted: "border-primary/30 bg-primary/10 text-primary",
  suspended: "border-destructive/40 bg-destructive/10 text-destructive-foreground",
  unpaid: "border-primary/30 bg-primary/10 text-primary",
  unavailable: "border-white/10 bg-white/[0.05] text-muted-foreground",
  under_review: "border-primary/30 bg-primary/10 text-primary",
  cancelled: "border-white/10 bg-white/[0.05] text-muted-foreground",
} as const;

const labels: Record<string, string> = {
  submitted: "pending",
};

export function StatusBadge({ value }: { value: string }) {
  const tone = tones[value as keyof typeof tones] ?? "border-white/10 bg-white/[0.05] text-muted-foreground";
  const label = labels[value] ?? value.replaceAll("_", " ");

  return (
    <span className={cn("inline-flex rounded-full border px-3 py-1 text-xs font-semibold capitalize tracking-wide", tone)}>
      {label}
    </span>
  );
}
