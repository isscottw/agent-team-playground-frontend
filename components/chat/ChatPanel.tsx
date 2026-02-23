"use client";

import { useRef, useEffect } from "react";
import { useTeam } from "@/contexts/TeamContext";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";

export function ChatPanel() {
  const { state } = useTeam();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [state.messages]);

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="px-5 py-2.5 border-b border-mid/15 flex items-center shrink-0">
        <span className="text-sm font-medium text-fg">Conversation</span>
        <span className="text-xs text-mid ml-2">
          {state.messages.length} message{state.messages.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0">
        {state.messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-sm text-mid/60">
            No messages yet
          </div>
        ) : (
          state.messages.map((msg, i) => (
            <ChatMessage key={msg.id || `msg-${i}`} message={msg} />
          ))
        )}
        <div ref={bottomRef} />
      </div>

      <ChatInput />
    </div>
  );
}
