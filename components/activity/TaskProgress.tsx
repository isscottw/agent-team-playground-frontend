"use client";

import { useTeam } from "@/contexts/TeamContext";

export function TaskProgress() {
  const { state } = useTeam();

  if (state.tasks.length === 0) {
    return (
      <div className="text-xs text-mid/60 px-3 py-2">No tasks yet</div>
    );
  }

  return (
    <div className="space-y-1 px-3 py-2">
      {state.tasks.map((task) => (
        <div key={task.id} className="flex items-start gap-2 text-xs">
          <span className="shrink-0 mt-0.5">
            {task.status === "completed" && <span className="text-success">✓</span>}
            {task.status === "in_progress" && <span className="text-working">◐</span>}
            {task.status === "pending" && <span className="text-mid">○</span>}
            {task.status === "failed" && <span className="text-error">✗</span>}
          </span>
          <div className="flex-1 min-w-0">
            <p className="font-light text-fg truncate">{task.description}</p>
            {task.assignedTo && (
              <p className="text-[10px] text-mid">{task.assignedTo}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
