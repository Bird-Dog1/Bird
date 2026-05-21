import { cn } from "@/lib/utils";

const tones = {
  approved: "border-accent/40 bg-accent/10 text-accent",
  available: "border-accent/40 bg-accent/10 text-accent",
  denied: "border-destructive/40 bg-destructive/10 text-destructive-foreground",
  pending: "border-primary/40 bg-primary/10 text-primary",
  rented: "border-primary/40 bg-primary/10 text-primary",
  submitted: "border-primary/40 bg-primary/10 text-primary",
  suspended: "border-destructive/40 bg-destructive/10 text-destructive-foreground",
  unavailable: "border-border bg-secondary text-muted-foreground",
  under_review: "border-primary/40 bg-primary/10 text-primary",
  cancelled: "border-border bg-secondary text-muted-foreground",
} as const;

export function StatusBadge({ value }: { value: string }) {
  const tone = tones[value as keyof typeof tones] ?? "border-border bg-secondary text-muted-foreground";

  return (
    <span className={cn("inline-flex rounded-full border px-3 py-1 text-xs font-semibold capitalize", tone)}>
      {value.replaceAll("_", " ")}
    </span>
  );
}
