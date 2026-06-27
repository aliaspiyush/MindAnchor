import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Anchor, BrainCircuit, Activity, LineChart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative px-4 pt-24 pb-32 text-center md:pt-32 overflow-hidden flex-1">
        {/* Glow effect behind */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="relative z-10 max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-secondary text-background shadow-xl shadow-primary/20 mb-8">
            <Anchor size={32} strokeWidth={2.5} />
          </div>
          
          <h1 className="font-serif text-5xl md:text-7xl leading-tight text-text-primary">
            Your exam journey starts with <span className="text-gradient">understanding yourself.</span>
          </h1>
          
          <p className="text-lg md:text-xl text-text-muted max-w-2xl mx-auto leading-relaxed">
            MindAnchor reads your daily reflections, detects hidden stress patterns, and gives you AI support that adapts to your exam countdown.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link href="/signup">
              <Button size="lg" className="w-full sm:w-auto h-14 px-8 text-lg rounded-full">
                Start Free
              </Button>
            </Link>
            <a href="#features">
              <Button variant="ghost" size="lg" className="w-full sm:w-auto h-14 px-8 text-lg rounded-full">
                See How It Works
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-surface/50 border-t border-border/50">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-background border-border/50 hover:border-primary/50 transition-colors">
              <CardContent className="p-8 space-y-4">
                <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-6">
                  <BrainCircuit size={24} />
                </div>
                <h3 className="font-serif text-2xl text-text-primary">Journal Intelligence</h3>
                <p className="text-text-muted leading-relaxed">
                  Write freely. Gemini AI analyzes your language to detect burnout risk, cognitive patterns, and hidden stress triggers standard trackers miss.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-background border-border/50 hover:border-secondary/50 transition-colors">
              <CardContent className="p-8 space-y-4">
                <div className="h-12 w-12 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center mb-6">
                  <Activity size={24} />
                </div>
                <h3 className="font-serif text-2xl text-text-primary">Exam-Aware Coach</h3>
                <p className="text-text-muted leading-relaxed">
                  An empathetic AI companion that knows your emotional history and how many days are left until your exam. Never generic advice.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-background border-border/50 hover:border-success/50 transition-colors">
              <CardContent className="p-8 space-y-4">
                <div className="h-12 w-12 rounded-xl bg-success/10 text-success flex items-center justify-center mb-6">
                  <LineChart size={24} />
                </div>
                <h3 className="font-serif text-2xl text-text-primary">Pattern Insights</h3>
                <p className="text-text-muted leading-relaxed">
                  Visualize your emotional arc over the last 14 days. See what triggers your anxiety and track your confidence growth.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border text-center text-text-muted text-sm">
        <p>MindAnchor — Your Exam-Aware AI Wellness Companion</p>
      </footer>
    </div>
  );
}
