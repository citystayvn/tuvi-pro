import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/utils/cn";

const badgeVariants = cva("inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium", {
  variants: {
    variant: {
      default: "border-transparent bg-accent text-accent-foreground",
      secondary: "border-transparent bg-secondary text-secondary-foreground",
      outline: "text-foreground",
      success: "border-transparent bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
      warning: "border-transparent bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
      danger: "border-transparent bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300",
      info: "border-transparent bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-300",
    },
  },
  defaultVariants: { variant: "default" },
});

export function Badge({ className, variant, ...props }: React.HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
