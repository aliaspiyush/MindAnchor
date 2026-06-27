import { GoogleGenerativeAI } from '@google/generative-ai';
import type { CompanionContext, CompanionResponse, ChatMessage } from '@/types';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

function buildSystemPrompt(context: CompanionContext): string {
  const stressTrendText = {
    improving: 'Their stress levels have been improving recently — acknowledge the progress.',
    stable: 'Their stress levels have been stable.',
    worsening: 'Their stress levels have been worsening — be extra attentive and supportive.',
  }[context.stress_trend];

  const recentAnalysesSummary = context.recent_analyses
    .map(
      (a, i) =>
        `  Entry ${i + 1}: mood=${a.mood_score}/10, stress=${a.stress_score}/10, burnout=${a.burnout_risk}, feeling: ${a.dominant_emotion}`
    )
    .join('\n');

  return `You are MindAnchor, a warm, grounded, empathetic AI companion for students preparing for high-stakes exams. You have access to the student's emotional history, exam timeline, and recent journal analyses. You do NOT give generic advice. Every response is tailored to this specific student's current state, exam proximity, and recent patterns.

If a student needs a coping intervention, call the appropriate tool instead of just describing it. Keep responses concise — 3 to 5 sentences max unless the student asks for more. Never claim to be a therapist or medical professional.

--- STUDENT CONTEXT ---
Name: ${context.student_name}
Exam: ${context.exam_type}
Days until exam: ${context.days_until_exam}
Study intensity: ${context.study_intensity}
Weak subjects: ${context.weak_subjects.join(', ') || 'None specified'}
Current support priority: ${context.current_support_priority}
Stress trend: ${stressTrendText}

Recent emotional history:
${recentAnalysesSummary || '  No journal entries yet.'}
--- END CONTEXT ---`;
}

// Tool declarations for Gemini function calling
const companionTools = [
  {
    functionDeclarations: [
      {
        name: 'trigger_breathing_session',
        description:
          'Initiate a guided breathing exercise when the student is feeling anxious, stressed, or overwhelmed. Use this instead of just telling them to breathe.',
        parameters: {
          type: 'OBJECT' as const,
          properties: {
            duration_minutes: {
              type: 'NUMBER' as const,
              description: 'Duration of the breathing session in minutes (1-10)',
            },
          },
          required: ['duration_minutes'],
        },
      },
      {
        name: 'show_grounding_exercise',
        description:
          'Show a grounding exercise to help the student reconnect with the present moment during panic or dissociation.',
        parameters: {
          type: 'OBJECT' as const,
          properties: {
            technique: {
              type: 'STRING' as const,
              enum: ['5-4-3-2-1', 'box_breathing', 'body_scan'],
              description: 'The grounding technique to use',
            },
          },
          required: ['technique'],
        },
      },
      {
        name: 'show_affirmation_card',
        description:
          'Display a personalized affirmation card when the student needs confidence boosting or positive reinforcement.',
        parameters: {
          type: 'OBJECT' as const,
          properties: {
            exam_type: {
              type: 'STRING' as const,
              description: 'The exam the student is preparing for',
            },
            mood_context: {
              type: 'STRING' as const,
              description: 'The current emotional context for personalization',
            },
          },
          required: ['exam_type', 'mood_context'],
        },
      },
      {
        name: 'suggest_lighter_plan',
        description:
          'Suggest a lighter study plan when the student is burned out or overstudying. Provides a modified approach to reduce pressure.',
        parameters: {
          type: 'OBJECT' as const,
          properties: {
            reason: {
              type: 'STRING' as const,
              description: 'Why a lighter plan is being suggested',
            },
          },
          required: ['reason'],
        },
      },
      {
        name: 'trigger_exam_prep_boost',
        description:
          'Provide targeted encouragement and focus strategies for specific weak subjects the student is struggling with.',
        parameters: {
          type: 'OBJECT' as const,
          properties: {
            weak_subjects: {
              type: 'ARRAY' as const,
              items: { type: 'STRING' as const },
              description: 'The subjects to focus on',
            },
          },
          required: ['weak_subjects'],
        },
      },
      {
        name: 'trigger_rest_mode',
        description:
          'Activate rest mode when the student needs to step away from studying. Shows a calming interface with a timer.',
        parameters: {
          type: 'OBJECT' as const,
          properties: {
            duration_hours: {
              type: 'NUMBER' as const,
              description: 'Recommended rest duration in hours',
            },
          },
          required: ['duration_hours'],
        },
      },
    ],
  },
];

/**
 * Chat with the AI companion. Handles both text responses and function calling.
 */
export async function companionChat(
  message: string,
  history: ChatMessage[],
  context: CompanionContext
): Promise<CompanionResponse> {
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
    systemInstruction: buildSystemPrompt(context),
    tools: companionTools,
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 500,
    },
  });

  // Convert chat history to Gemini format
  const geminiHistory = history.map((msg) => ({
    role: msg.role === 'user' ? ('user' as const) : ('model' as const),
    parts: [{ text: msg.content }],
  }));

  const chat = model.startChat({
    history: geminiHistory,
  });

  const result = await chat.sendMessage(message);
  const response = result.response;

  // Check for function calls
  const functionCalls = response.functionCalls();
  if (functionCalls && functionCalls.length > 0) {
    const call = functionCalls[0];
    // Get the text part of the response (if any)
    const textPart = response.text() || '';

    return {
      reply: textPart || `Let me help you with that.`,
      function_call: {
        name: call.name,
        args: call.args as Record<string, unknown>,
      },
    };
  }

  return {
    reply: response.text(),
  };
}
