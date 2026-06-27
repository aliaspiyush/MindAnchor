"use client";

import { useState } from "react";
import { SendHorizontal } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading: boolean;
}

export function ChatInput({ onSend, isLoading }: ChatInputProps) {
  const [text, setText] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || isLoading) return;
    
    onSend(text);
    setText("");
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 w-full p-4 bg-background border-t border-border">
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type your message..."
        className="flex-1 bg-surface rounded-full px-5 py-3 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50 border border-border"
        disabled={isLoading}
      />
      <Button 
        type="submit" 
        size="lg" 
        disabled={!text.trim() || isLoading}
        className="rounded-full w-12 h-12 p-0 flex items-center justify-center shrink-0"
      >
        <SendHorizontal size={20} className={text.trim() && !isLoading ? "text-background" : "text-text-muted"} />
      </Button>
    </form>
  );
}
