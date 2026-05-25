import { type ComponentPropsWithoutRef } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type BaseFieldProps = {
  label: string;
  name: string;
  hint?: string;
  className?: string;
};

export function TextField({
  label,
  hint,
  className,
  id,
  name,
  ...props
}: BaseFieldProps & ComponentPropsWithoutRef<typeof Input>) {
  const fieldId = id ?? name;

  return (
    <div className={cn("space-y-2.5", className)}>
      <Label htmlFor={fieldId}>{label}</Label>
      <Input id={fieldId} name={name} {...props} />
      {hint ? <p className="text-xs leading-5 text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

export function TextareaField({
  label,
  hint,
  className,
  id,
  name,
  ...props
}: BaseFieldProps & ComponentPropsWithoutRef<typeof Textarea>) {
  const fieldId = id ?? name;

  return (
    <div className={cn("space-y-2.5", className)}>
      <Label htmlFor={fieldId}>{label}</Label>
      <Textarea id={fieldId} name={name} {...props} />
      {hint ? <p className="text-xs leading-5 text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

export function SelectField({
  label,
  hint,
  className,
  id,
  name,
  children,
  ...props
}: BaseFieldProps & ComponentPropsWithoutRef<"select">) {
  const fieldId = id ?? name;

  return (
    <div className={cn("space-y-2.5", className)}>
      <Label htmlFor={fieldId}>{label}</Label>
      <select
        id={fieldId}
        name={name}
        className="flex h-12 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-foreground shadow-inner shadow-black/20 hover:border-white/20 focus-visible:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
        {...props}
      >
        {children}
      </select>
      {hint ? <p className="text-xs leading-5 text-muted-foreground">{hint}</p> : null}
    </div>
  );
}
