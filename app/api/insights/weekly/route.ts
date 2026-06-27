import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import type { WeeklyInsightsResponse, BurnoutRisk } from '@/types';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function GET() {
  try {
    const supabase = await createClient();

    // Verify authentication
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    // Load user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, exam_type, exam_date')
      .eq('id', user.id)
      .single();

    // Load last 14 days of analyses
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    const { data: analyses } = await supabase
      .from('entry_analyses')
      .select('*')
      .eq('user_id', user.id)
      .gte('created_at', fourteenDaysAgo.toISOString())
      .order('created_at', { ascending: true });

    if (!analyses || analyses.length === 0) {
      return NextResponse.json({
        charts_data: {
          mood_trend: [],
          stress_trend: [],
          confidence_trend: [],
          burnout_history: [],
          trigger_frequency: [],
        },
        narrative: '',
      } as WeeklyInsightsResponse);
    }

    // Build chart data
    const moodTrend = analyses.map((a) => ({
      date: new Date(a.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
      score: a.mood_score as number,
    }));

    const stressTrend = analyses.map((a) => ({
      date: new Date(a.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
      score: a.stress_score as number,
    }));

    const confidenceTrend = analyses.map((a) => ({
      date: new Date(a.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
      score: a.confidence_score as number,
    }));

    const burnoutHistory = analyses.map((a) => ({
      date: new Date(a.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
      risk: a.burnout_risk as BurnoutRisk,
    }));

    // Calculate trigger frequency
    const triggerCounts: Record<string, number> = {};
    analyses.forEach((a) => {
      const triggers = a.stress_triggers as string[] | null;
      if (triggers) {
        triggers.forEach((t: string) => {
          triggerCounts[t] = (triggerCounts[t] || 0) + 1;
        });
      }
    });

    const triggerFrequency = Object.entries(triggerCounts)
      .map(([trigger, count]) => ({ trigger, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    // Generate weekly narrative via Gemini
    const analysesSummary = analyses
      .map(
        (a) =>
          `Day ${new Date(a.created_at).toLocaleDateString('en-IN', { weekday: 'short' })}: mood=${a.mood_score}/10, stress=${a.stress_score}/10, burnout=${a.burnout_risk}, feeling: ${a.dominant_emotion}`
      )
      .join('\n');

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      generationConfig: { temperature: 0.5, maxOutputTokens: 200 },
    });

    const narrativeResult = await model.generateContent(
      `You are MindAnchor. Write a 3-4 sentence empathetic weekly summary for ${profile?.full_name || 'a student'} preparing for ${profile?.exam_type || 'their exam'}. Based on their emotional data:\n\n${analysesSummary}\n\nBe warm, specific, and highlight both struggles and strengths. Don't use bullet points.`
    );

    const narrative = narrativeResult.response.text();

    return NextResponse.json({
      charts_data: {
        mood_trend: moodTrend,
        stress_trend: stressTrend,
        confidence_trend: confidenceTrend,
        burnout_history: burnoutHistory,
        trigger_frequency: triggerFrequency,
      },
      narrative,
    } as WeeklyInsightsResponse);
  } catch (error) {
    console.error('Weekly insights error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred.' },
      { status: 500 }
    );
  }
}
