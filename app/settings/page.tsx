"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import type { ExamType, StudyIntensity } from "@/types";

export default function SettingsPage() {
  const [fullName, setFullName] = useState("");
  const [examType, setExamType] = useState<ExamType>("OTHER");
  const [examDate, setExamDate] = useState("");
  const [intensity, setIntensity] = useState<StudyIntensity>("moderate");
  const [streak, setStreak] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{type: "success" | "error", text: string} | null>(null);
  
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return router.push("/login");

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profile) {
        setFullName(profile.full_name || "");
        setExamType(profile.exam_type as ExamType || "OTHER");
        setExamDate(profile.exam_date || "");
        setIntensity(profile.study_intensity as StudyIntensity || "moderate");
        setStreak(profile.streak_count || 0);
      }
      setIsLoading(false);
    }
    loadProfile();
  }, [supabase, router]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: fullName,
        exam_type: examType,
        exam_date: examDate || null,
        study_intensity: intensity,
      })
      .eq("id", user.id);

    setIsSaving(false);
    if (error) {
      setMessage({ type: "error", text: "Failed to update profile." });
    } else {
      setMessage({ type: "success", text: "Profile updated successfully." });
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm("Are you sure? This cannot be undone.")) return;
    
    // In a real app, this should call a secure server action / Edge Function
    // Since we don't have service role on client, we just sign out.
    await supabase.auth.signOut();
    router.push("/");
  };

  if (isLoading) return <div className="p-8 text-center text-text-muted">Loading...</div>;

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8 space-y-8">
      <h1 className="font-serif text-4xl">Settings</h1>

      <Card>
        <CardHeader>
          <CardTitle>Profile Details</CardTitle>
          <p className="text-sm text-text-muted">Current Streak: {streak} days</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            <Input 
              label="Full Name" 
              value={fullName} 
              onChange={e => setFullName(e.target.value)} 
            />
            
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-text-muted">Exam Type</label>
              <select 
                value={examType}
                onChange={e => setExamType(e.target.value as ExamType)}
                className="flex h-10 w-full rounded-lg bg-surface-elevated border border-border px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="NEET">NEET</option>
                <option value="JEE">JEE</option>
                <option value="CUET">CUET</option>
                <option value="CAT">CAT</option>
                <option value="GATE">GATE</option>
                <option value="UPSC">UPSC</option>
                <option value="OTHER">OTHER</option>
              </select>
            </div>

            <Input 
              label="Exam Date" 
              type="date"
              value={examDate} 
              onChange={e => setExamDate(e.target.value)} 
            />

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-text-muted">Study Intensity</label>
              <select 
                value={intensity}
                onChange={e => setIntensity(e.target.value as StudyIntensity)}
                className="flex h-10 w-full rounded-lg bg-surface-elevated border border-border px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="light">Light</option>
                <option value="moderate">Moderate</option>
                <option value="intense">Intense</option>
              </select>
            </div>

            {message && (
              <div className={`p-3 rounded-lg text-sm border ${message.type === 'success' ? 'bg-success/10 text-success border-success/20' : 'bg-danger/10 text-danger border-danger/20'}`}>
                {message.text}
              </div>
            )}

            <Button type="submit" isLoading={isSaving} className="mt-4">
              Save Changes
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border-danger/20">
        <CardHeader>
          <CardTitle className="text-danger">Danger Zone</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-text-muted mb-4">
            Once you delete your account, there is no going back. Please be certain.
          </p>
          <Button variant="danger" onClick={handleDeleteAccount}>
            Delete Account
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
