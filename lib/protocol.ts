import type { SSEEvent, SSEEventType, Message, Task, AgentState, SessionStatus, ErrorEvent } from "@/types";

export function parseSSEEvent(eventType: string, data: string): SSEEvent | null {
  try {
    const parsed = JSON.parse(data);
    const type = eventType as SSEEventType;

    switch (type) {
      case "message":
        return { type, data: parsed as Message };
      case "task_update":
        return { type, data: parsed as Task };
      case "agent_state":
        return { type, data: parsed as AgentState };
      case "session_status":
        return { type, data: parsed as SessionStatus };
      case "error":
        return { type, data: parsed as ErrorEvent };
      default:
        return null;
    }
  } catch {
    return null;
  }
}

export function isMessage(event: SSEEvent): event is SSEEvent & { data: Message } {
  return event.type === "message";
}

export function isTaskUpdate(event: SSEEvent): event is SSEEvent & { data: Task } {
  return event.type === "task_update";
}

export function isAgentState(event: SSEEvent): event is SSEEvent & { data: AgentState } {
  return event.type === "agent_state";
}

export function isSessionStatus(event: SSEEvent): event is SSEEvent & { data: SessionStatus } {
  return event.type === "session_status";
}

export function isError(event: SSEEvent): event is SSEEvent & { data: ErrorEvent } {
  return event.type === "error";
}
