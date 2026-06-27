import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { LineChart, Line, ResponsiveContainer } from "recharts";
import { Flame, Calendar, BookHeart, MessageSquareText, BarChart3, AlertTriangle, ArrowRight } from "lucide-react";
import { daysUntilExam } from "@/lib/utils";

// Minimal client component wrapper for the sparkline
import { DashboardSparkline } from "@/components/insights/DashboardSparkline";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) {
    redirect("/onboarding");
  }

  // Fetch recent analysis for insight and alert
  const { data: recentAnalyses } = await supabase
    .from("entry_analyses")
    .select("mood_score, burnout_risk, gemini_insight, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(7);

  const latestAnalysis = recentAnalyses?.[0];
  const isHighRisk = latestAnalysis?.burnout_risk === 'high' || latestAnalysis?.burnout_risk === 'critical';
  const daysLeft = daysUntilExam(profile.exam_date);

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8 space-y-8 animate-in fade-in duration-500">
      
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="font-serif text-4xl text-text-primary">
            Welcome back, {profile.full_name?.split(' ')[0] || "Student"}
          </h1>
          <p className="text-text-muted">Stay grounded on your journey to {profile.exam_type || "your exam"}.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-surface-elevated px-4 py-2 rounded-xl border border-border">
            <Flame className="text-warning" size={20} />
            <span className="font-semibold text-text-primary">Day {profile.streak_count} streak</span>
          </div>
          {daysLeft !== null && (
            <div className="flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-xl border border-primary/20 text-primary">
              <Calendar size={20} />
              <span className="font-semibold">{daysLeft} days left</span>
            </div>
          )}
        </div>
      </div>

      {/* Stress Alert Banner */}
      {isHighRisk && (
        <div className="bg-danger/10 border border-danger/30 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-danger">
            <AlertTriangle size={24} />
            <div>
              <p className="font-semibold">Burnout Risk Detected</p>
              <p className="text-sm opacity-90">Your recent reflections indicate high stress. Let's recalibrate.</p>
            </div>
          </div>
          <Link href="/companion">
            <Button variant="danger" size="sm" className="whitespace-nowrap">
              Talk to MindAnchor <ArrowRight size={16} className="ml-2" />
            </Button>
          </Link>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Large Journal CTA */}
        <Card className="md:col-span-2 bg-gradient-to-br from-surface-elevated to-surface border-primary/20 hover:border-primary/50 transition-colors group">
          <Link href="/journal" className="block h-full">
            <CardContent className="p-8 flex flex-col justify-between h-full min-h-[240px]">
              <div className="space-y-2">
                <div className="h-12 w-12 rounded-xl bg-primary/20 text-primary flex items-center justify-center mb-6">
                  <BookHeart size={24} />
                </div>
                <h2 className="font-serif text-3xl">How are you feeling today?</h2>
                <p className="text-text-muted max-w-md">Take 2 minutes to write your reflection. It helps MindAnchor understand how to support you best.</p>
              </div>
              <div className="mt-8 flex items-center text-primary font-medium group-hover:translate-x-2 transition-transform">
                Write your reflection <ArrowRight size={20} className="ml-2" />
              </div>
            </CardContent>
          </Link>
        </Card>

        {/* Latest Insight */}
        <Card className="bg-surface border-border flex flex-col">
          <CardContent className="p-6 flex flex-col h-full">
            <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-4">Latest Insight</h3>
            {latestAnalysis ? (
              <div className="flex-1 flex flex-col justify-between">
                <p className="text-lg italic text-text-primary/90 leading-relaxed">
                  "{latestAnalysis.gemini_insight}"
                </p>
                <div className="mt-6">
                  <span className="text-xs text-text-faint">Mood Sparkline (7 days)</span>
                  <div className="h-12 w-full mt-2">
                    <DashboardSparkline data={recentAnalyses.map(a => a.mood_score).reverse()} />
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-center opacity-50">
                <p>Complete a journal entry to see insights here.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <Link href="/companion">
          <Card className="hover:bg-white/[0.02] transition-colors cursor-pointer border-secondary/20">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="bg-secondary/20 p-3 rounded-lg text-secondary">
                <MessageSquareText size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Talk to AI</h3>
                <p className="text-text-muted text-sm">Get contextual coaching & support</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/insights">
          <Card className="hover:bg-white/[0.02] transition-colors cursor-pointer border-success/20">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="bg-success/20 p-3 rounded-lg text-success">
                <BarChart3 size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-lg">View Insights</h3>
                <p className="text-text-muted text-sm">Track your emotional patterns</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

    </div>
  );
}
