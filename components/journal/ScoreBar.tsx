import * as React from "react";
import { cn } from "@/lib/utils";

interface ScoreBarProps {
  label: string;
  value: number;
  max?: number;
  colorClass?: string;
  className?: string;
}

export function ScoreBar({
  label,
  value,
  max = 10,
  colorClass = "bg-primary",
  className,
}: ScoreBarProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="flex justify-between text-sm font-medium">
        <span className="text-text-primary">{label}</span>
        <span className="text-text-muted">
          {value}/{max}
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-surface-elevated border border-border">
        <div
          className={cn("h-full rounded-full transition-all duration-1000 ease-out", colorClass)}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
