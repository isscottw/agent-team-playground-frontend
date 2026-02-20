"use client";

import { useRef, useEffect } from "react";
import { useTeam } from "@/contexts/TeamContext";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";

export function ChatPanel() {
  const { state } = useTeam();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [state.messages]);

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-2 border-b border-mid/15 flex items-center">
        <span className="text-xs font-medium text-fg">Conversation</span>
        <span className="text-[10px] text-mid ml-2">
          {state.messages.length} message{state.messages.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        {state.messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-sm text-mid/60">
            No messages yet
          </div>
        ) : (
          state.messages.map((msg) => (
            <ChatMessage key={msg.id} message={msg} />
          ))
        )}
      </div>

      <ChatInput />
    </div>
  );
}
