import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-semibold tracking-[-0.01em] shadow-sm transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-primary/10 hover:-translate-y-0.5 hover:bg-white hover:shadow-xl hover:shadow-white/10",
        secondary:
          "border border-white/10 bg-white/[0.07] text-secondary-foreground shadow-black/20 hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.11]",
        ghost:
          "text-muted-foreground hover:bg-white/[0.07] hover:text-foreground",
        outline:
          "border border-white/14 bg-background/30 text-foreground shadow-black/20 hover:-translate-y-0.5 hover:border-white/25 hover:bg-white/[0.08]",
        link: "rounded-none text-primary underline-offset-4 shadow-none hover:underline",
      },
      size: {
        default: "h-11 px-5 py-2",
        sm: "h-9 px-4",
        lg: "h-12 px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
