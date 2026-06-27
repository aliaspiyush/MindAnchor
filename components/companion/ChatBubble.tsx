import { ChatMessage } from "@/types";
import { cn, timeAgo } from "@/lib/utils";
import { Anchor, User } from "lucide-react";
import * as Coping from "@/components/coping";

export function ChatBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";

  const renderFunctionCall = () => {
    if (!message.function_call) return null;

    const { name, args } = message.function_call;
    
    return (
      <div className="mt-3 w-full max-w-sm">
        {name === 'trigger_breathing_session' && <Coping.BreathingCircle args={args} />}
        {name === 'show_grounding_exercise' && <Coping.GroundingCard args={args} />}
        {name === 'show_affirmation_card' && <Coping.AffirmationCard args={args} />}
        {name === 'trigger_rest_mode' && <Coping.RestModeCard args={args} />}
        {name === 'trigger_exam_prep_boost' && <Coping.ExamPrepBoost args={args} />}
        {name === 'suggest_lighter_plan' && <Coping.LighterPlan args={args} />}
      </div>
    );
  };

  return (
    <div className={cn("flex w-full gap-3", isUser ? "flex-row-reverse" : "flex-row")}>
      <div className={cn(
        "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
        isUser ? "bg-surface-elevated text-text-muted" : "bg-primary/20 text-primary"
      )}>
        {isUser ? <User size={16} /> : <Anchor size={16} strokeWidth={2.5} />}
      </div>

      <div className={cn("flex flex-col max-w-[80%]", isUser ? "items-end" : "items-start")}>
        <div className={cn(
          "px-4 py-2.5 rounded-2xl whitespace-pre-wrap",
          isUser 
            ? "bg-primary text-background rounded-tr-sm" 
            : "bg-surface-elevated text-text-primary border border-border rounded-tl-sm"
        )}>
          {message.content}
        </div>
        
        {renderFunctionCall()}
        
        <span className="text-[10px] text-text-faint mt-1.5 px-1">
          {timeAgo(message.timestamp)}
        </span>
      </div>
    </div>
  );
}
