"use client";

import { cn } from "@/utils/cn";

interface AgentStateBadgeProps {
  state: "idle" | "working" | "blocked";
}

export function AgentStateBadge({ state }: AgentStateBadgeProps) {
  return (
    <span
      className={cn(
        "text-[11px] font-normal",
        state === "idle" && "text-mid",
        state === "working" && "text-working",
        state === "blocked" && "text-error"
      )}
    >
      {state === "idle" && "● idle"}
      {state === "working" && "◐ working"}
      {state === "blocked" && "○ blocked"}
    </span>
  );
}
