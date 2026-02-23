"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ChatMessage } from "@/components/chat/ChatMessage";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useOptionalTeam } from "@/contexts/TeamContext";
import { api } from "@/lib/api";
import { ArrowLeft, Trash2, Radio } from "lucide-react";
import type { Message, Agent } from "@/types";

interface SessionSummary {
  id: string;
  status: string;
  created_at: string;
  agents: string[];
  config: {
    agents?: Array<{
      name: string;
      role: string;
      model: string;
      provider: string;
      connections?: string[];
      system_prompt?: string;
    }>;
  };
}

interface HistoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type View =
  | { kind: "list" }
  | { kind: "detail"; sessionId: string }
  | { kind: "confirm-delete"; sessionId: string }
  | { kind: "confirm-reconnect"; session: SessionSummary };

export function HistoryModal({ open, onOpenChange }: HistoryModalProps) {
  const { session } = useAuth();
  const team = useOptionalTeam();
  const [view, setView] = useState<View>({ kind: "list" });
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const loadSessions = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getHistory(session?.access_token);
      setSessions(data.sessions as SessionSummary[]);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    if (open) {
      setView({ kind: "list" });
      loadSessions();
    }
  }, [open, loadSessions]);

  const handleSessionClick = (s: SessionSummary) => {
    if (s.status === "running" && team) {
      // Running session — offer to reconnect
      setView({ kind: "confirm-reconnect", session: s });
    } else {
      // Ended session — show history
      loadDetail(s.id);
    }
  };

  const [reconnecting, setReconnecting] = useState(false);

  const reconnectToSession = async (s: SessionSummary) => {
    if (!team) return;
    setReconnecting(true);

    // Check if session is still alive on the backend
    const alive = await api.checkSession(s.id);
    if (!alive) {
      // Session is gone from the backend — mark as ended and show history
      setSessions((prev) =>
        prev.map((sess) => (sess.id === s.id ? { ...sess, status: "ended" } : sess))
      );
      setReconnecting(false);
      loadDetail(s.id);
      return;
    }

    // Build Agent objects from session config
    const configAgents = s.config?.agents || [];
    const agents: Agent[] = configAgents.map((a, i) => ({
      id: `agent-${i}`,
      name: a.name,
      role: (a.role === "leader" ? "leader" : "teammate") as Agent["role"],
      provider: a.provider as Agent["provider"],
      model: a.model,
      systemPrompt: a.system_prompt || "",
      connections: a.connections || [],
    }));

    // Set up TeamContext for this session
    team.dispatch({ type: "SET_AGENTS", agents });
    team.dispatch({ type: "SET_SESSION_ID", sessionId: s.id });
    team.dispatch({ type: "SET_MESSAGES", messages: [] });
    team.dispatch({ type: "SET_TASKS", tasks: [] });
    team.setMode("running");

    setReconnecting(false);
    onOpenChange(false);
  };

  const loadDetail = async (sessionId: string) => {
    setView({ kind: "detail", sessionId });
    setLoading(true);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data = (await api.getSessionHistory(sessionId, session?.access_token)) as any;
      const raw = data.messages || [];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mapped: Message[] = raw.map((m: any) => ({
        id: String(m.id),
        sessionId: m.session_id || sessionId,
        role: m.from_agent === "user" ? ("user" as const) : ("agent" as const),
        agentName: m.from_agent === "user" ? undefined : m.from_agent,
        content: m.text || "",
        timestamp: m.timestamp || "",
      }));
      setMessages(mapped);
    } catch {
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = async (sessionId: string) => {
    if (deleting) return;
    setDeleting(true);
    try {
      await api.deleteSessionHistory(sessionId, session?.access_token);
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
      setView({ kind: "list" });
    } catch {
      // ignore
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[70vh] flex flex-col">
        <DialogHeader>
          {view.kind === "detail" ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setView({ kind: "list" })}
                className="text-mid hover:text-fg transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <DialogTitle>Session {view.sessionId.slice(0, 8)}</DialogTitle>
            </div>
          ) : view.kind === "confirm-delete" ? (
            <DialogTitle>Delete Session?</DialogTitle>
          ) : view.kind === "confirm-reconnect" ? (
            <DialogTitle>Reconnect to Session?</DialogTitle>
          ) : (
            <>
              <DialogTitle>Session History</DialogTitle>
              <DialogDescription>
                Past agent team sessions.
              </DialogDescription>
            </>
          )}
        </DialogHeader>

        <div className="flex-1 overflow-y-auto min-h-0 -mx-6 px-6">
          {/* --- Confirm reconnect --- */}
          {view.kind === "confirm-reconnect" ? (
            <div className="py-4 space-y-4">
              <p className="text-sm text-mid">
                This will connect you to the running session{" "}
                <span className="text-fg font-medium">{view.session.id.slice(0, 8)}</span>{" "}
                with agents: <span className="text-fg">{view.session.agents.join(", ")}</span>.
              </p>
              {team?.state.sessionId && (
                <p className="text-sm text-amber-600">
                  You are currently in another session. Reconnecting will leave it.
                </p>
              )}
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setView({ kind: "list" })}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={() => reconnectToSession(view.session)}
                  disabled={reconnecting}
                >
                  {reconnecting ? "Checking..." : "Reconnect"}
                </Button>
              </div>
            </div>
          ) : view.kind === "confirm-delete" ? (
            /* --- Confirm delete --- */
            <div className="py-4 space-y-4">
              <p className="text-sm text-mid">
                This will permanently delete session{" "}
                <span className="text-fg font-medium">{view.sessionId.slice(0, 8)}</span>{" "}
                and all its messages, turns, and tasks. This cannot be undone.
              </p>
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setView({ kind: "list" })}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  className="bg-red-500 hover:bg-red-600 text-white border-0"
                  onClick={() => confirmDelete(view.sessionId)}
                  disabled={deleting}
                >
                  {deleting ? "Deleting..." : "Delete"}
                </Button>
              </div>
            </div>
          ) : loading ? (
            <p className="text-sm text-mid font-light py-4">Loading...</p>
          ) : view.kind === "list" ? (
            /* --- Session list --- */
            sessions.length === 0 ? (
              <p className="text-sm text-mid font-light py-4">No sessions yet.</p>
            ) : (
              <div className="space-y-1">
                {sessions.map((s) => (
                  <div
                    key={s.id}
                    onClick={() => handleSessionClick(s)}
                    className="w-full flex items-center justify-between p-3 border border-mid/15 hover:border-mid/30 transition-colors group text-left cursor-pointer"
                  >
                    <div className="min-w-0">
                      <span className="text-sm font-normal text-fg group-hover:text-hover transition-colors">
                        Session {s.id.slice(0, 8)}
                      </span>
                      <span className="text-[11px] text-mid ml-3">
                        {new Date(s.created_at).toLocaleDateString()}{" "}
                        {new Date(s.created_at).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      {s.agents?.length > 0 && (
                        <span className="text-[11px] text-mid/60 ml-2">
                          {s.agents.join(", ")}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {s.status === "running" ? (
                        <span className="inline-flex items-center gap-1 text-[11px] text-green-600">
                          <Radio className="h-3 w-3" />
                          live
                        </span>
                      ) : (
                        <span className="text-[11px] text-mid">{s.status}</span>
                      )}
                      <div
                        role="button"
                        tabIndex={0}
                        onClick={(e) => {
                          e.stopPropagation();
                          setView({ kind: "confirm-delete", sessionId: s.id });
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.stopPropagation();
                            setView({ kind: "confirm-delete", sessionId: s.id });
                          }
                        }}
                        className="opacity-0 group-hover:opacity-100 text-mid hover:text-red-500 transition-all p-1 cursor-pointer"
                        title="Delete session"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            /* --- Session detail (ended sessions) --- */
            messages.length === 0 ? (
              <p className="text-sm text-mid/60 py-4">No messages in this session.</p>
            ) : (
              <div className="-mx-6">
                {messages.map((msg) => (
                  <ChatMessage key={msg.id} message={msg} />
                ))}
              </div>
            )
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
