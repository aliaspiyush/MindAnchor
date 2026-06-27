"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

interface BreathingCircleProps {
  args: any;
}
export function BreathingCircle({ args }: BreathingCircleProps) {
  const [active, setActive] = useState(false);
  return (
    <div className="p-4 bg-surface-elevated rounded-xl border border-border text-center space-y-4">
      <div className="text-primary font-serif text-lg">Guided Breathing ({args.duration_minutes} min)</div>
      <div className="flex justify-center py-8">
        <div className={`h-24 w-24 rounded-full bg-primary/20 flex items-center justify-center transition-all ${active ? 'animate-breathe' : ''}`}>
          <div className="h-12 w-12 rounded-full bg-primary/40"></div>
        </div>
      </div>
      <Button onClick={() => setActive(!active)} variant={active ? "ghost" : "primary"}>
        {active ? "Stop" : "Start Breathing"}
      </Button>
    </div>
  );
}

export function GroundingCard({ args }: { args: any }) {
  return (
    <div className="p-4 bg-surface-elevated rounded-xl border border-border space-y-2">
      <div className="text-secondary font-serif text-lg">Grounding Exercise</div>
      <div className="text-sm text-text-primary capitalize">{args.technique.replace('_', ' ')}</div>
      <p className="text-text-muted text-sm mt-2">Take a moment to reconnect with your surroundings.</p>
    </div>
  );
}

export function AffirmationCard({ args }: { args: any }) {
  return (
    <div className="p-6 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-xl border border-primary/20 text-center space-y-2">
      <div className="text-primary font-serif text-2xl">You've got this.</div>
      <p className="text-text-primary italic">"Your prep for {args.exam_type} is valid, and your feelings of {args.mood_context} are natural."</p>
    </div>
  );
}

export function RestModeCard({ args }: { args: any }) {
  return (
    <div className="p-4 bg-surface-elevated rounded-xl border border-border space-y-2 text-center">
      <div className="text-success font-serif text-lg">Rest Mode Activated</div>
      <p className="text-text-muted text-sm">Suggested rest: {args.duration_hours} hours</p>
    </div>
  );
}

export function ExamPrepBoost({ args }: { args: any }) {
  return (
    <div className="p-4 bg-surface-elevated rounded-xl border border-border space-y-2">
      <div className="text-warning font-serif text-lg">Focus Strategy</div>
      <p className="text-sm text-text-primary">Targeting weak subjects: {args.weak_subjects?.join(', ')}</p>
    </div>
  );
}

export function LighterPlan({ args }: { args: any }) {
  return (
    <div className="p-4 bg-surface-elevated rounded-xl border border-border space-y-2">
      <div className="text-success font-serif text-lg">Lighter Plan</div>
      <p className="text-sm text-text-primary">Reason: {args.reason}</p>
    </div>
  );
}
