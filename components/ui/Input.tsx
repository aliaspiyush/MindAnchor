import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className="flex w-full flex-col space-y-1.5">
        {label && (
          <label className="text-sm font-medium text-text-muted">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={cn(
            "flex h-10 w-full rounded-lg bg-surface-elevated border border-border px-3 py-2 text-sm text-text-primary placeholder:text-text-faint focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all duration-200",
            error && "border-danger focus:ring-danger/50",
            className
          )}
          {...props}
        />
        {error && <span className="text-xs text-danger">{error}</span>}
      </div>
    );
  }
);
Input.displayName = "Input";
