"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import type { ExamType, StudyIntensity } from "@/types";

const EXAM_TYPES: ExamType[] = ["NEET", "JEE", "CUET", "CAT", "GATE", "UPSC", "OTHER"];
const SUBJECTS = [
  "Physics", "Chemistry", "Mathematics", "Biology", 
  "History", "Geography", "Polity", "Economics",
  "Aptitude", "Logical Reasoning", "Verbal Ability"
];

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [examType, setExamType] = useState<ExamType | null>(null);
  const [examDate, setExamDate] = useState<string>("");
  const [intensity, setIntensity] = useState<StudyIntensity | null>(null);
  const [weakSubjects, setWeakSubjects] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleNext = () => setStep((s) => Math.min(s + 1, 4));
  const handleBack = () => setStep((s) => Math.max(s - 1, 1));

  const toggleSubject = (subject: string) => {
    setWeakSubjects((prev) => 
      prev.includes(subject) 
        ? prev.filter((s) => s !== subject)
        : [...prev, subject]
    );
  };

  const handleComplete = async () => {
    setIsLoading(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push("/login");
        return;
      }

      await supabase
        .from("profiles")
        .update({
          exam_type: examType,
          exam_date: examDate || null,
          study_intensity: intensity,
          weak_subjects: weakSubjects,
        })
        .eq("id", user.id);

      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      console.error("Onboarding failed:", error);
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center p-4">
      {/* Progress Bar */}
      <div className="mb-8 w-full max-w-md">
        <div className="flex justify-between text-xs text-text-muted mb-2 px-1">
          <span>Step {step} of 4</span>
          <span>{Math.round((step / 4) * 100)}% Completed</span>
        </div>
        <div className="h-1.5 w-full bg-surface-elevated rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary transition-all duration-500 ease-in-out"
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>
      </div>

      <Card className="w-full max-w-md min-h-[400px] flex flex-col justify-between">
        <CardContent className="p-8 pt-8 flex-1">
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="space-y-2">
                <h2 className="font-serif text-3xl">What exam are you preparing for?</h2>
                <p className="text-text-muted">This helps MindAnchor understand your specific pressures.</p>
              </div>
              <div className="flex flex-wrap gap-3">
                {EXAM_TYPES.map((type) => (
                  <button
                    key={type}
                    onClick={() => setExamType(type)}
                    className={cn(
                      "px-6 py-3 rounded-full text-sm font-medium transition-all duration-200 border",
                      examType === type
                        ? "bg-primary text-background border-primary scale-[1.02]"
                        : "bg-surface-elevated text-text-primary border-border hover:border-primary/50"
                    )}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="space-y-2">
                <h2 className="font-serif text-3xl">When is your exam?</h2>
                <p className="text-text-muted">We'll adjust our support as the date gets closer.</p>
              </div>
              <div className="pt-4">
                <label htmlFor="exam-date" className="block text-sm font-medium text-text-muted mb-2">Exam Date</label>
                <input
                  id="exam-date"
                  type="date"
                  value={examDate}
                  onChange={(e) => setExamDate(e.target.value)}
                  className="w-full rounded-lg bg-surface-elevated border border-border p-4 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50 text-lg"
                  required
                  aria-required="true"
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="space-y-2">
                <h2 className="font-serif text-3xl">How intense is your current schedule?</h2>
                <p className="text-text-muted">Select what best describes your daily routine.</p>
              </div>
              <div className="space-y-3">
                {[
                  { id: "light", label: "Light", desc: "Just starting, few hours a day" },
                  { id: "moderate", label: "Moderate", desc: "Steady prep, balanced routine" },
                  { id: "intense", label: "Intense", desc: "Full throttle, studying all day" },
                ].map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setIntensity(option.id as StudyIntensity)}
                    className={cn(
                      "w-full text-left p-4 rounded-xl border transition-all duration-200",
                      intensity === option.id
                        ? "bg-primary/10 border-primary text-primary"
                        : "bg-surface-elevated border-border text-text-primary hover:border-primary/50"
                    )}
                  >
                    <div className="font-semibold">{option.label}</div>
                    <div className={cn("text-sm mt-1", intensity === option.id ? "text-primary/80" : "text-text-muted")}>
                      {option.desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="space-y-2">
                <h2 className="font-serif text-3xl">Any stressful subjects?</h2>
                <p className="text-text-muted">Select subjects that cause you the most anxiety (optional).</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {SUBJECTS.map((subject) => (
                  <button
                    key={subject}
                    onClick={() => toggleSubject(subject)}
                    className={cn(
                      "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 border",
                      weakSubjects.includes(subject)
                        ? "bg-danger/20 text-danger border-danger/50"
                        : "bg-surface-elevated text-text-primary border-border hover:border-danger/30"
                    )}
                  >
                    {subject}
                  </button>
                ))}
              </div>
            </div>
          )}
        </CardContent>

        {/* Footer Actions */}
        <div className="p-8 pt-0 flex justify-between gap-4 mt-auto">
          {step > 1 ? (
            <Button variant="ghost" onClick={handleBack} className="w-1/3">
              Back
            </Button>
          ) : (
            <div className="w-1/3" /> // spacer
          )}
          
          {step < 4 ? (
            <Button 
              onClick={handleNext} 
              className="w-2/3"
              disabled={
                (step === 1 && !examType) || 
                (step === 2 && !examDate) || 
                (step === 3 && !intensity)
              }
            >
              Continue
            </Button>
          ) : (
            <Button onClick={handleComplete} className="w-2/3" isLoading={isLoading}>
              Complete Setup
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
