"use client";

import type { Message } from "@/types";
import { cn } from "@/utils/cn";

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";
  const isSystem = message.role === "system";

  return (
    <div
      className={cn(
        "px-4 py-3 border-b border-mid/10",
        isSystem && "bg-bg/50"
      )}
    >
      <div className="flex items-baseline gap-2 mb-1">
        <span
          className={cn(
            "text-xs font-medium",
            isUser ? "text-fg" : isSystem ? "text-mid" : "text-fg"
          )}
        >
          {isUser ? "You" : isSystem ? "System" : message.agentName || "Agent"}
        </span>
        <span className="text-[10px] text-mid/60">
          {new Date(message.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>
      <p className="text-sm font-light leading-relaxed whitespace-pre-wrap">
        {message.content}
      </p>
    </div>
  );
}
