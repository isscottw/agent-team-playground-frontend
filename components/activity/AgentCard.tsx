"use client";

import { Crown, Users } from "lucide-react";
import type { Agent, AgentState, Message } from "@/types";
import { AgentStateBadge } from "./AgentStateBadge";

interface AgentCardProps {
  agent: Agent;
  agentState?: AgentState;
  recentMessages: Message[];
}

export function AgentCard({ agent, agentState, recentMessages }: AgentCardProps) {
  const lastMessage = recentMessages[recentMessages.length - 1];
  const isLeader = agent.role === "leader";

  return (
    <div className="border border-mid/15 p-3 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-fg flex items-center gap-1.5">
          {isLeader ? (
            <Crown className="h-3 w-3 text-amber-600" />
          ) : (
            <Users className="h-3 w-3 text-blue-600" />
          )}
          {agent.name}
        </span>
        <AgentStateBadge state={agentState?.state || "idle"} />
      </div>

      <div className="text-[11px] text-mid">
        {agent.provider} / {agent.model}
      </div>

      {lastMessage && (
        <p className="text-xs font-light text-fg/70 truncate">
          {lastMessage.content}
        </p>
      )}
    </div>
  );
}
