"use client";

import { useState, useEffect, useRef } from "react";
import { ChatBubble } from "@/components/companion/ChatBubble";
import { ChatInput } from "@/components/companion/ChatInput";
import { ContextBanner } from "@/components/companion/ContextBanner";
import { createClient } from "@/lib/supabase/client";
import type { ChatMessage } from "@/types";

export default function CompanionPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [contextData, setContextData] = useState<{days: number, intensity: string} | null>(null);
  
  const bottomRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  useEffect(() => {
    // Initial load: Fetch profile and today's session
    const loadInitData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("exam_date, study_intensity")
        .eq("id", user.id)
        .single();
        
      if (profile) {
        const days = profile.exam_date 
          ? Math.max(0, Math.ceil((new Date(profile.exam_date).getTime() - Date.now()) / 86400000))
          : 0;
        setContextData({ days, intensity: profile.study_intensity || "moderate" });
      }

      const today = new Date().toISOString().split('T')[0];
      const { data: session } = await supabase
        .from("chat_sessions")
        .select("id, messages")
        .eq("user_id", user.id)
        .eq("session_date", today)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (session) {
        setSessionId(session.id);
        setMessages((session.messages as ChatMessage[]) || []);
      }
    };
    
    loadInitData();
  }, []);

  useEffect(() => {
    // Auto-scroll to bottom
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSend = async (content: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const userMsg: ChatMessage = { role: "user", content, timestamp: new Date().toISOString() };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const response = await fetch("/api/companion/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: content,
          session_id: sessionId,
          user_id: user.id,
        }),
      });

      if (!response.ok) throw new Error("API Error");

      const data = await response.json();
      setSessionId(data.session_id);
      
      const assistantMsg: ChatMessage = {
        role: "assistant",
        content: data.reply,
        timestamp: new Date().toISOString(),
        function_call: data.function_call,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (error) {
      console.error(error);
      setMessages((prev) => [
        ...prev, 
        { role: "assistant", content: "I'm having trouble connecting right now. Please try again later.", timestamp: new Date().toISOString() }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-4xl mx-auto border-x border-border/50 bg-surface/30 shadow-2xl shadow-black/50 relative">
      {contextData && (
        <ContextBanner days={contextData.days} intensity={contextData.intensity} />
      )}
      
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 custom-scrollbar">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-50 space-y-4">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-primary">
              <span className="font-serif text-3xl">M</span>
            </div>
            <p className="text-lg">MindAnchor is here for you.<br/>How are you feeling about your prep right now?</p>
          </div>
        )}
        
        {messages.map((msg, i) => (
          <ChatBubble key={i} message={msg} />
        ))}
        
        {isLoading && (
          <div className="flex gap-2 items-center text-text-muted text-sm pl-12 animate-pulse">
            MindAnchor is typing...
          </div>
        )}
        
        <div ref={bottomRef} className="h-2" />
      </div>

      <ChatInput onSend={handleSend} isLoading={isLoading} />
    </div>
  );
}
