import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/utils/cn";

/** Select gốc của trình duyệt (tốt cho mobile & truy cập), phong cách shadcn. */
export const NativeSelect = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, children, ...props }, ref) => (
    <div className="relative">
      <select
        ref={ref}
        className={cn(
          "flex h-9 w-full appearance-none rounded-lg border border-input bg-card pl-3 pr-8 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50",
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
    </div>
  ),
);
NativeSelect.displayName = "NativeSelect";
