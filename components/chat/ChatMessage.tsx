"use client";

import Markdown from "react-markdown";
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
        "px-5 py-3 border-b border-mid/10",
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

      {isSystem ? (
        <p className="text-sm font-light leading-relaxed whitespace-pre-wrap">
          {message.content}
        </p>
      ) : (
        <div className="prose prose-sm max-w-none text-fg prose-headings:text-fg prose-strong:text-fg prose-code:text-fg prose-code:bg-mid/10 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-xs prose-code:before:content-none prose-code:after:content-none prose-pre:bg-mid/10 prose-pre:text-xs prose-pre:rounded prose-p:leading-relaxed prose-p:font-light">
          <Markdown>{message.content}</Markdown>
        </div>
      )}
    </div>
  );
}
