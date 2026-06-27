"use client";

import { useEffect, useState } from "react";
import { MoodChart } from "@/components/insights/MoodChart";
import { StressChart } from "@/components/insights/StressChart";
import { TriggerChart } from "@/components/insights/TriggerChart";
import { ConfidenceChart } from "@/components/insights/ConfidenceChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import type { WeeklyInsightsResponse } from "@/types";
import { Brain, CalendarDays } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { getBurnoutColor } from "@/lib/utils";

export default function InsightsPage() {
  const [data, setData] = useState<WeeklyInsightsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/insights/weekly")
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        setIsLoading(false);
      });
  }, []);

  if (isLoading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-text-muted">
          <Brain className="h-12 w-12 animate-pulse text-primary" />
          <p>Compiling your weekly insights...</p>
        </div>
      </div>
    );
  }

  if (!data || data.charts_data.mood_trend.length === 0) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center p-4">
        <Card className="max-w-md text-center p-8">
          <Brain className="mx-auto h-16 w-16 text-primary mb-6 opacity-50" />
          <h2 className="font-serif text-2xl mb-2">No data yet</h2>
          <p className="text-text-muted mb-6">Start journaling to unlock your personal emotional insights and patterns.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center gap-3">
        <CalendarDays className="h-8 w-8 text-primary" />
        <h1 className="font-serif text-4xl">Your week in review</h1>
      </div>

      <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
        <CardContent className="p-6 md:p-8">
          <div className="flex items-start gap-4">
            <Brain className="h-8 w-8 text-primary shrink-0 mt-1" />
            <p className="text-lg leading-relaxed text-text-primary/90">{data.narrative}</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <MoodChart data={data.charts_data.mood_trend} />
        <StressChart data={data.charts_data.stress_trend} />
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <ConfidenceChart data={data.charts_data.confidence_trend} />
        <TriggerChart data={data.charts_data.trigger_frequency} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Burnout Timeline (Last 14 days)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 overflow-x-auto pb-4 custom-scrollbar">
            {data.charts_data.burnout_history.map((h, i) => (
              <div key={i} className="flex flex-col items-center gap-2 min-w-16">
                <span className="text-xs text-text-muted">{h.date.split(' ')[0]}</span>
                <div 
                  className="w-4 h-4 rounded-full shadow-md"
                  style={{ backgroundColor: getBurnoutColor(h.risk) }}
                  title={h.risk}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
