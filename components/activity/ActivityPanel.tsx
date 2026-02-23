"use client";

import { useTeam } from "@/contexts/TeamContext";
import { AgentCard } from "./AgentCard";
import { TaskProgress } from "./TaskProgress";

export function ActivityPanel() {
  const { state } = useTeam();

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="px-5 py-2.5 border-b border-mid/15 flex items-center shrink-0">
        <span className="text-sm font-medium text-fg">Activity</span>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="px-3 py-2 border-b border-mid/15">
          <span className="text-[11px] text-mid uppercase tracking-wider">Agents</span>
        </div>

        <div className="p-3 space-y-2">
          {state.agents.map((agent) => (
            <AgentCard
              key={agent.id}
              agent={agent}
              agentState={state.agentStates[agent.name]}
              recentMessages={state.messages.filter(
                (m) => m.agentName === agent.name
              ).slice(-3)}
            />
          ))}
        </div>

        <div className="px-3 py-2 border-t border-mid/15 border-b border-mid/15">
          <span className="text-[11px] text-mid uppercase tracking-wider">Tasks</span>
        </div>

        <TaskProgress />
      </div>
    </div>
  );
}
