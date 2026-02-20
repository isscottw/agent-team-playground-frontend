"use client";

import { useEffect, useRef, useCallback } from "react";
import { useTeam } from "@/contexts/TeamContext";
import { api } from "@/lib/api";
import { parseSSEEvent, isMessage, isTaskUpdate, isAgentState, isSessionStatus } from "@/lib/protocol";
import type { Message, Task, AgentState, SessionStatus } from "@/types";

export function useSessionStream(sessionId: string | null) {
  const { dispatch, setMode } = useTeam();
  const eventSourceRef = useRef<EventSource | null>(null);

  const connect = useCallback(() => {
    if (!sessionId) return;

    // Close existing connection
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const url = api.getStreamUrl(sessionId);
    const es = new EventSource(url);
    eventSourceRef.current = es;

    const handleEvent = (eventType: string) => (e: MessageEvent) => {
      const event = parseSSEEvent(eventType, e.data);
      if (!event) return;

      if (isMessage(event)) {
        dispatch({ type: "ADD_MESSAGE", message: event.data as Message });
      } else if (isTaskUpdate(event)) {
        dispatch({ type: "UPDATE_TASK", task: event.data as Task });
      } else if (isAgentState(event)) {
        dispatch({ type: "SET_AGENT_STATE", state: event.data as AgentState });
      } else if (isSessionStatus(event)) {
        const status = event.data as SessionStatus;
        if (status.status === "stopped" || status.status === "completed" || status.status === "error") {
          setMode("stopped");
        }
      }
    };

    es.addEventListener("message", handleEvent("message"));
    es.addEventListener("task_update", handleEvent("task_update"));
    es.addEventListener("agent_state", handleEvent("agent_state"));
    es.addEventListener("session_status", handleEvent("session_status"));
    es.addEventListener("error", handleEvent("error"));

    es.onerror = () => {
      // EventSource will auto-reconnect
    };
  }, [sessionId, dispatch, setMode]);

  const disconnect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
  }, []);

  useEffect(() => {
    connect();
    return disconnect;
  }, [connect, disconnect]);

  return { connect, disconnect };
}
