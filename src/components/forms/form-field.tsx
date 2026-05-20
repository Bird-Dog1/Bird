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
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={fieldId}>{label}</Label>
      <Input id={fieldId} name={name} {...props} />
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
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
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={fieldId}>{label}</Label>
      <Textarea id={fieldId} name={name} {...props} />
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
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
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={fieldId}>{label}</Label>
      <select
        id={fieldId}
        name={name}
        className="flex h-11 w-full rounded-xl border border-input bg-background/60 px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
        {...props}
      >
        {children}
      </select>
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}
