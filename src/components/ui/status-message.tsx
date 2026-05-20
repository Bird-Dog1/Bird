import { type ReactNode } from "react";

import { cn } from "@/lib/utils";

type StatusMessageProps = {
  children: ReactNode;
  tone?: "error" | "success" | "info";
};

const toneClasses = {
  error: "border-destructive/40 bg-destructive/10 text-destructive-foreground",
  success: "border-accent/40 bg-accent/10 text-accent",
  info: "border-border bg-secondary/40 text-muted-foreground",
};

export function StatusMessage({ children, tone = "info" }: StatusMessageProps) {
  return (
    <p
      className={cn("rounded-xl border p-3 text-sm", toneClasses[tone])}
      role={tone === "error" ? "alert" : "status"}
    >
      {children}
    </p>
  );
}
