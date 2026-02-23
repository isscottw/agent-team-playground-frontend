"use client";

import { useEffect, useRef, useCallback } from "react";
import { useTeam } from "@/contexts/TeamContext";
import { api } from "@/lib/api";
import type { Message, AgentState } from "@/types";

let msgCounter = 0;

function makeMessage(
  role: "user" | "agent" | "system",
  content: string,
  agentName?: string,
  sessionId?: string,
): Message {
  msgCounter++;
  return {
    id: `msg-${Date.now()}-${msgCounter}`,
    sessionId: sessionId || "",
    role,
    agentName,
    content,
    timestamp: new Date().toISOString(),
  };
}

export function useSessionStream(sessionId: string | null) {
  const { dispatch, setMode } = useTeam();
  const eventSourceRef = useRef<EventSource | null>(null);

  const connect = useCallback(() => {
    if (!sessionId) return;

    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const url = api.getStreamUrl(sessionId);
    const es = new EventSource(url);
    eventSourceRef.current = es;

    // Backend sends all events as default SSE "message" events
    // with data: {type, agent, data, session_id, timestamp}
    es.onmessage = (e: MessageEvent) => {
      try {
        const event = JSON.parse(e.data);
        const eventType = event.type as string;
        const agent = event.agent as string | undefined;
        const data = event.data || {};

        switch (eventType) {
          case "agent_response": {
            const content = data.content || "";
            if (content) {
              dispatch({
                type: "ADD_MESSAGE",
                message: makeMessage("agent", content, agent, sessionId),
              });
            }
            break;
          }

          case "agent_message": {
            // Agent sent a message to another agent via SendMessage tool
            const text = data.text || data.content || "";
            const to = data.to || "";
            const summary = data.summary || "";
            dispatch({
              type: "ADD_MESSAGE",
              message: makeMessage(
                "system",
                `${agent} → ${to}: ${summary || text}`,
                agent,
                sessionId,
              ),
            });
            break;
          }

          case "tool_call": {
            const toolName = data.tool || "";
            dispatch({
              type: "ADD_MESSAGE",
              message: makeMessage(
                "system",
                `${agent} called ${toolName}`,
                agent,
                sessionId,
              ),
            });
            break;
          }

          case "thinking":
          case "turn_start": {
            if (agent) {
              const agentState: AgentState = {
                agentName: agent,
                state: "working",
              };
              dispatch({ type: "SET_AGENT_STATE", state: agentState });
            }
            break;
          }

          case "turn_end": {
            // Delay idle state so "working" is visible for at least 2s
            if (agent) {
              setTimeout(() => {
                dispatch({
                  type: "SET_AGENT_STATE",
                  state: { agentName: agent, state: "idle" } as AgentState,
                });
              }, 2000);
            }
            break;
          }

          case "task_update": {
            dispatch({
              type: "UPDATE_TASK",
              task: {
                id: data.id || "",
                sessionId: sessionId || "",
                description: data.subject || data.description || "",
                status: data.status || "pending",
                assignedTo: data.owner,
                createdAt: event.timestamp || new Date().toISOString(),
                updatedAt: event.timestamp || new Date().toISOString(),
              },
            });
            break;
          }

          case "error": {
            const errorMsg = data.message || "Unknown error";
            dispatch({
              type: "ADD_MESSAGE",
              message: makeMessage("system", `Error: ${errorMsg}`, agent, sessionId),
            });
            break;
          }

          case "session_end": {
            dispatch({
              type: "ADD_MESSAGE",
              message: makeMessage("system", "Session complete — all agents finished.", undefined, sessionId),
            });
            setMode("stopped");
            break;
          }

          case "protocol_message": {
            const protocolType = data.protocol_type || "unknown";
            const from = data.from || agent || "system";
            if (protocolType === "idle_notification") {
              if (from) {
                dispatch({
                  type: "SET_AGENT_STATE",
                  state: { agentName: from, state: "idle" } as AgentState,
                });
              }
              dispatch({
                type: "ADD_MESSAGE",
                message: makeMessage("system", `${from} is now idle`, agent, sessionId),
              });
            } else if (protocolType === "shutdown_request") {
              dispatch({
                type: "ADD_MESSAGE",
                message: makeMessage("system", `Shutdown requested: ${data.reason || ""}`, undefined, sessionId),
              });
            } else if (protocolType === "task_assignment") {
              dispatch({
                type: "ADD_MESSAGE",
                message: makeMessage("system", `Task #${data.task_id} assigned to ${data.assigned_to}`, agent, sessionId),
              });
            } else if (protocolType === "shutdown_approved") {
              dispatch({
                type: "ADD_MESSAGE",
                message: makeMessage("system", `${from} approved shutdown`, agent, sessionId),
              });
            } else if (protocolType === "task_completed") {
              dispatch({
                type: "ADD_MESSAGE",
                message: makeMessage("system", `${from} completed task #${data.task_id}: ${data.task_subject || ""}`, agent, sessionId),
              });
            } else if (protocolType === "plan_approval_request") {
              dispatch({
                type: "ADD_MESSAGE",
                message: makeMessage("system", `${from} requests plan approval (request: ${data.request_id || ""})`, agent, sessionId),
              });
            } else if (protocolType === "plan_approval_response") {
              const approved = data.approve ? "approved" : "rejected";
              dispatch({
                type: "ADD_MESSAGE",
                message: makeMessage("system", `Plan ${approved} by ${from} (request: ${data.request_id || ""})`, agent, sessionId),
              });
            }
            break;
          }

          // session_start, tool_result — ignore in chat
          default:
            break;
        }
      } catch {
        // Ignore unparseable events (keepalives, etc.)
      }
    };

    es.onerror = () => {
      // EventSource auto-reconnects
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
