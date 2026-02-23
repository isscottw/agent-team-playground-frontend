"use client";

import { cn } from "@/utils/cn";

interface AgentStateBadgeProps {
  state: "idle" | "working" | "blocked";
}

export function AgentStateBadge({ state }: AgentStateBadgeProps) {
  return (
    <span
      className={cn(
        "text-[11px] font-normal inline-flex items-center gap-1",
        state === "idle" && "text-mid",
        state === "working" && "text-working",
        state === "blocked" && "text-error"
      )}
    >
      {state === "working" && (
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-working animate-pulse" />
      )}
      {state === "idle" && "● idle"}
      {state === "working" && "working..."}
      {state === "blocked" && "○ blocked"}
    </span>
  );
}
