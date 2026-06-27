import * as React from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ScoreBar } from "./ScoreBar";
import { Sparkles, Activity, ShieldAlert } from "lucide-react";
import { getBurnoutColor, getBurnoutLabel } from "@/lib/utils";

// Note: Ensure getBurnoutLabel is in utils, or map it here.
const burnoutLabels = {
  low: "Low Risk",
  moderate: "Moderate Risk",
  high: "High Risk",
  critical: "Critical Risk",
};

interface AnalysisResultProps {
  analysis: {
    mood_score: number;
    stress_score: number;
    confidence_score: number;
    burnout_risk: 'low' | 'moderate' | 'high' | 'critical';
    gemini_insight: string;
  };
}

export function AnalysisResult({ analysis }: AnalysisResultProps) {
  return (
    <Card className="overflow-hidden border-primary/20 bg-primary/5 animate-in slide-in-from-bottom-4 fade-in duration-500">
      <CardContent className="p-6">
        <div className="flex items-start gap-4 mb-6">
          <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary">
            <Sparkles size={20} />
          </div>
          <div>
            <h4 className="font-serif text-xl text-text-primary mb-2">MindAnchor Insight</h4>
            <p className="text-text-muted leading-relaxed">{analysis.gemini_insight}</p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 pt-6 border-t border-border">
          <ScoreBar 
            label="Mood" 
            value={analysis.mood_score} 
            colorClass={analysis.mood_score > 5 ? "bg-success" : "bg-warning"} 
          />
          <ScoreBar 
            label="Stress" 
            value={analysis.stress_score} 
            colorClass={analysis.stress_score > 7 ? "bg-danger" : analysis.stress_score > 4 ? "bg-warning" : "bg-success"} 
          />
          
          <div className="flex flex-col justify-center space-y-1.5">
            <span className="text-sm font-medium text-text-primary">Burnout Risk</span>
            <div className="flex items-center gap-2">
              <Badge 
                variant={
                  analysis.burnout_risk === 'critical' || analysis.burnout_risk === 'high' 
                    ? 'danger' 
                    : analysis.burnout_risk === 'moderate' ? 'warning' : 'success'
                }
                className="px-3 py-1 text-sm"
              >
                {analysis.burnout_risk === 'critical' && <ShieldAlert size={14} className="mr-1.5" />}
                {analysis.burnout_risk === 'high' && <Activity size={14} className="mr-1.5" />}
                {burnoutLabels[analysis.burnout_risk]}
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
