import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { analyzeJournalEntry } from '@/lib/gemini/analyze';

export async function POST(request: NextRequest) {
  try {
    const { entry_text, user_id } = await request.json();

    // Validation
    if (!entry_text || entry_text.trim().length < 20) {
      return NextResponse.json(
        { error: 'Journal entry must be at least 20 characters.' },
        { status: 400 }
      );
    }

    if (!user_id) {
      return NextResponse.json(
        { error: 'User ID is required.' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Verify the user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || user.id !== user_id) {
      return NextResponse.json(
        { error: 'Unauthorized.' },
        { status: 401 }
      );
    }

    // 1. Analyze with Gemini
    const analysis = await analyzeJournalEntry(entry_text.trim());

    // 2. Save journal entry
    const { data: entry, error: entryError } = await supabase
      .from('journal_entries')
      .insert({ user_id, entry_text: entry_text.trim() })
      .select('id')
      .single();

    if (entryError) {
      console.error('Error saving journal entry:', entryError);
      return NextResponse.json(
        { error: 'Failed to save journal entry.' },
        { status: 500 }
      );
    }

    // 3. Save analysis
    const { error: analysisError } = await supabase
      .from('entry_analyses')
      .insert({
        entry_id: entry.id,
        user_id,
        mood_score: analysis.mood_score,
        stress_score: analysis.stress_score,
        confidence_score: analysis.confidence_score,
        burnout_risk: analysis.burnout_risk,
        dominant_emotion: analysis.dominant_emotion,
        stress_triggers: analysis.stress_triggers,
        cognitive_patterns: analysis.cognitive_patterns,
        support_priority: analysis.support_priority,
        gemini_insight: analysis.gemini_insight,
      });

    if (analysisError) {
      console.error('Error saving analysis:', analysisError);
      return NextResponse.json(
        { error: 'Failed to save analysis.' },
        { status: 500 }
      );
    }

    // 4. Update streak count
    // Check if user journaled yesterday
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    const { data: yesterdayEntries } = await supabase
      .from('journal_entries')
      .select('id')
      .eq('user_id', user_id)
      .gte('created_at', `${yesterdayStr}T00:00:00`)
      .lt('created_at', `${yesterdayStr}T23:59:59`)
      .limit(1);

    // Get current streak
    const { data: profile } = await supabase
      .from('profiles')
      .select('streak_count')
      .eq('id', user_id)
      .single();

    const currentStreak = profile?.streak_count || 0;
    const newStreak = yesterdayEntries && yesterdayEntries.length > 0
      ? currentStreak + 1
      : 1; // Reset to 1 if no entry yesterday

    await supabase
      .from('profiles')
      .update({ streak_count: newStreak })
      .eq('id', user_id);

    return NextResponse.json({
      entry_id: entry.id,
      analysis,
    });
  } catch (error) {
    console.error('Journal analyze error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred.' },
      { status: 500 }
    );
  }
}
