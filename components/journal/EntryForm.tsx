"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { AnalysisResult } from "./AnalysisResult";
import { getRotatingPlaceholder } from "@/lib/utils";
import { Brain, ArrowRight } from "lucide-react";

interface EntryFormProps {
  userId: string;
}

export function EntryForm({ userId }: EntryFormProps) {
  const [text, setText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [entryId, setEntryId] = useState<string | null>(null);
  const [placeholder, setPlaceholder] = useState("");
  const router = useRouter();

  const minChars = 20;
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  const charCount = text.length;

  useEffect(() => {
    setPlaceholder(getRotatingPlaceholder());
    // Rotate placeholder every 10 seconds if empty
    const interval = setInterval(() => {
      if (!text) setPlaceholder(getRotatingPlaceholder());
    }, 10000);
    return () => clearInterval(interval);
  }, [text]);

  const handleSubmit = async () => {
    if (charCount < minChars) return;
    
    setIsSubmitting(true);
    setAnalysis(null);

    try {
      const response = await fetch("/api/journal/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entry_text: text, user_id: userId }),
      });

      if (!response.ok) throw new Error("Failed to analyze entry");

      const data = await response.json();
      setAnalysis(data.analysis);
      setEntryId(data.entry_id);
    } catch (error) {
      console.error(error);
      // Handle error gracefully in a real app
    } finally {
      setIsSubmitting(false);
    }
  };

  if (analysis) {
    return (
      <div className="space-y-6">
        <AnalysisResult analysis={analysis} />
        <div className="flex gap-4">
          <Button onClick={() => router.push(`/journal/${entryId}`)} variant="secondary" className="flex-1">
            View Full Analysis
          </Button>
          <Button onClick={() => router.push(`/companion`)} className="flex-1 group">
            Talk to AI about this
            <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={16} />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="relative">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={placeholder}
            className="w-full min-h-[250px] resize-y bg-transparent p-6 text-lg text-text-primary placeholder:text-text-muted focus:outline-none"
            disabled={isSubmitting}
          />
          
          {isSubmitting && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm animate-in fade-in">
              <Brain className="h-12 w-12 text-primary animate-pulse mb-4" />
              <p className="font-serif text-xl text-primary animate-pulse">MindAnchor is reading your reflection...</p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-border bg-surface p-4">
          <div className="text-sm text-text-muted flex gap-4">
            <span className={charCount < minChars ? "text-warning" : "text-success"}>
              {charCount}/{minChars} chars min
            </span>
            <span>{wordCount} words</span>
          </div>

          <Button 
            onClick={handleSubmit} 
            disabled={charCount < minChars || isSubmitting}
            isLoading={isSubmitting}
          >
            Analyze & Save
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
