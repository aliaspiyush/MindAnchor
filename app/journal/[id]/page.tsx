import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ScoreBar } from "@/components/journal/ScoreBar";
import { formatDate, getSupportPriorityColor } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { ArrowLeft, MessageSquareText, BrainCircuit, AlertTriangle } from "lucide-react";

export default async function JournalEntryPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  // Wait for params in Next.js 15
  const resolvedParams = await params;

  // Fetch entry and its analysis
  const { data: entry } = await supabase
    .from("journal_entries")
    .select("*")
    .eq("id", resolvedParams.id)
    .eq("user_id", user.id)
    .single();

  if (!entry) notFound();

  const { data: analysis } = await supabase
    .from("entry_analyses")
    .select("*")
    .eq("entry_id", entry.id)
    .single();

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8 space-y-8">
      <Link href="/journal" className="inline-flex items-center text-sm text-text-muted hover:text-text-primary transition-colors">
        <ArrowLeft size={16} className="mr-2" />
        Back to Journal
      </Link>

      <div className="flex flex-col md:flex-row gap-8 items-start">
        {/* Left Column: The Entry */}
        <div className="flex-1 space-y-6 w-full">
          <div className="space-y-1">
            <h1 className="font-serif text-3xl">Reflection</h1>
            <p className="text-text-muted">{formatDate(entry.created_at)}</p>
          </div>
          
          <Card className="bg-surface/50">
            <CardContent className="p-6">
              <p className="whitespace-pre-wrap text-lg leading-relaxed text-text-primary">
                {entry.entry_text}
              </p>
            </CardContent>
          </Card>

          <Link href="/companion" className="block w-full">
            <Button className="w-full group py-6 text-lg">
              <MessageSquareText className="mr-2" />
              Talk to MindAnchor about this entry
            </Button>
          </Link>
        </div>

        {/* Right Column: Analysis */}
        {analysis && (
          <div className="w-full md:w-80 shrink-0 space-y-6">
            <Card className="border-secondary/20 bg-secondary/5">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-xl text-secondary">
                  <BrainCircuit size={20} />
                  AI Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                
                {/* Highlight Quote */}
                <div className="rounded-lg bg-surface-elevated/50 p-4 border border-border/50 italic text-text-primary/90">
                  "{analysis.gemini_insight}"
                </div>

                {/* Scores */}
                <div className="space-y-4 pt-2">
                  <ScoreBar label="Mood" value={analysis.mood_score} colorClass="bg-primary" />
                  <ScoreBar label="Stress" value={analysis.stress_score} colorClass="bg-warning" />
                  <ScoreBar label="Confidence" value={analysis.confidence_score} colorClass="bg-success" />
                </div>

                {/* Tags section */}
                {analysis.stress_triggers && analysis.stress_triggers.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">Stress Triggers</span>
                    <div className="flex flex-wrap gap-2">
                      {analysis.stress_triggers.map((tag: string) => (
                        <Badge key={tag} variant="outline" className="border-danger/30 text-danger/80">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {analysis.cognitive_patterns && analysis.cognitive_patterns.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">Cognitive Patterns</span>
                    <div className="flex flex-wrap gap-2">
                      {analysis.cognitive_patterns.map((tag: string) => (
                        <Badge key={tag} variant="outline" className="border-secondary/30 text-secondary/80">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Priorities */}
                <div className="flex justify-between items-center pt-4 border-t border-border">
                  <span className="text-sm font-medium text-text-muted">Support Priority</span>
                  <Badge 
                    style={{ backgroundColor: `${getSupportPriorityColor(analysis.support_priority)}20`, color: getSupportPriorityColor(analysis.support_priority) }}
                    className="capitalize border-none"
                  >
                    {analysis.support_priority}
                  </Badge>
                </div>

              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
