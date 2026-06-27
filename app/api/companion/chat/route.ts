import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { companionChat } from '@/lib/gemini/companion';
import { daysUntilExam, getStressTrend } from '@/lib/utils';
import type { CompanionContext, ChatMessage, SupportPriority } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const { message, session_id, user_id } = await request.json();

    if (!message || !user_id) {
      return NextResponse.json(
        { error: 'Message and user_id are required.' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Verify authentication
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || user.id !== user_id) {
      return NextResponse.json(
        { error: 'Unauthorized.' },
        { status: 401 }
      );
    }

    // Load user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user_id)
      .single();

    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found.' },
        { status: 404 }
      );
    }

    // Load last 5 analyses
    const { data: recentAnalyses } = await supabase
      .from('entry_analyses')
      .select('mood_score, stress_score, burnout_risk, dominant_emotion, created_at')
      .eq('user_id', user_id)
      .order('created_at', { ascending: false })
      .limit(5);

    // Compute stress trend
    const stressScores = (recentAnalyses || [])
      .map((a) => a.stress_score)
      .reverse();
    const stressTrend = getStressTrend(stressScores);

    // Get latest support priority
    const latestPriority: SupportPriority =
      (recentAnalyses?.[0] as { support_priority?: SupportPriority } | undefined)
        ?.support_priority || 'none';

    // Build companion context
    const context: CompanionContext = {
      student_name: profile.full_name || 'Student',
      exam_type: profile.exam_type || 'OTHER',
      days_until_exam: daysUntilExam(profile.exam_date) ?? 0,
      study_intensity: profile.study_intensity || 'moderate',
      weak_subjects: profile.weak_subjects || [],
      recent_analyses: recentAnalyses || [],
      stress_trend: stressTrend,
      current_support_priority: latestPriority,
    };

    // Load or create chat session
    const today = new Date().toISOString().split('T')[0];
    let currentSessionId = session_id;
    let chatHistory: ChatMessage[] = [];

    if (currentSessionId) {
      const { data: existingSession } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('id', currentSessionId)
        .single();

      if (existingSession) {
        chatHistory = (existingSession.messages as ChatMessage[]) || [];
      }
    } else {
      // Check for today's session
      const { data: todaySession } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('user_id', user_id)
        .eq('session_date', today)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (todaySession) {
        currentSessionId = todaySession.id;
        chatHistory = (todaySession.messages as ChatMessage[]) || [];
      } else {
        // Create new session
        const { data: newSession } = await supabase
          .from('chat_sessions')
          .insert({ user_id, messages: [], session_date: today })
          .select('id')
          .single();

        currentSessionId = newSession?.id;
      }
    }

    // Call Gemini companion
    const response = await companionChat(message, chatHistory, context);

    // Build updated messages
    const newUserMessage: ChatMessage = {
      role: 'user',
      content: message,
      timestamp: new Date().toISOString(),
    };

    const newAssistantMessage: ChatMessage = {
      role: 'assistant',
      content: response.reply,
      timestamp: new Date().toISOString(),
      function_call: response.function_call,
    };

    const updatedMessages = [...chatHistory, newUserMessage, newAssistantMessage];

    // Update chat session
    await supabase
      .from('chat_sessions')
      .update({ messages: updatedMessages })
      .eq('id', currentSessionId);

    // If function call — save coping action
    if (response.function_call) {
      const actionTypeMap: Record<string, string> = {
        trigger_breathing_session: 'breathing',
        show_grounding_exercise: 'grounding',
        show_affirmation_card: 'affirmation',
        suggest_lighter_plan: 'lighter_plan',
        trigger_exam_prep_boost: 'exam_prep_boost',
        trigger_rest_mode: 'rest_mode',
      };

      const actionType = actionTypeMap[response.function_call.name];
      if (actionType) {
        await supabase.from('coping_actions').insert({
          user_id,
          action_type: actionType,
          triggered_by: 'companion_chat',
        });
      }
    }

    return NextResponse.json({
      reply: response.reply,
      session_id: currentSessionId,
      function_call: response.function_call,
    });
  } catch (error) {
    console.error('Companion chat error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred.' },
      { status: 500 }
    );
  }
}
