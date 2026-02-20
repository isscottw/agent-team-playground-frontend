"use client";

import { useState, useCallback } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTeam } from "@/contexts/TeamContext";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";

export function ChatInput() {
  const [value, setValue] = useState("");
  const { state } = useTeam();
  const { session } = useAuth();
  const isRunning = state.mode === "running";

  const handleSend = useCallback(async () => {
    const trimmed = value.trim();
    if (!trimmed || !state.sessionId) return;

    setValue("");
    try {
      await api.sendMessage(state.sessionId, trimmed, session?.access_token);
    } catch (err) {
      console.error("Failed to send message:", err);
    }
  }, [value, state.sessionId, session]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  return (
    <div className="border-t border-mid/15 p-3">
      <div className="flex items-center gap-2">
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={!isRunning}
          placeholder={isRunning ? "Send a message..." : "Start a session to chat"}
          className="flex-1 h-9 bg-transparent border border-mid/20 px-3 text-sm font-light text-fg placeholder:text-mid/40 focus:outline-none focus:border-mid/50 transition-colors disabled:opacity-40"
        />
        <Button
          size="icon"
          onClick={handleSend}
          disabled={!isRunning || !value.trim()}
        >
          <Send className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
