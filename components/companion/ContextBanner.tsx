import { Info } from "lucide-react";

export function ContextBanner({ days, intensity }: { days: number, intensity: string }) {
  return (
    <div className="w-full bg-primary/5 border-b border-primary/10 px-4 py-2 flex items-center justify-center gap-2 text-xs text-primary/80">
      <Info size={14} />
      <span>
        Context loaded: <strong>{days} days</strong> to exam • <strong>{intensity}</strong> study phase
      </span>
    </div>
  );
}
