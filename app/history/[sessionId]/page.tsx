"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { TopBar } from "@/components/TopBar";
import { ChatMessage } from "@/components/chat/ChatMessage";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import type { Message, Task } from "@/types";

export default function SessionReplayPage() {
  const params = useParams();
  const sessionId = params.sessionId as string;
  const { session } = useAuth();
  const router = useRouter();

  const [messages, setMessages] = useState<Message[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const data = await api.getSessionHistory(sessionId, session?.access_token) as any;
        // Map Supabase rows to frontend Message type
        const rawMessages = data.messages || [];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const mapped: Message[] = rawMessages.map((m: any) => ({
          id: String(m.id),
          sessionId: m.session_id || sessionId,
          role: m.from_agent === "user" ? "user" as const : "agent" as const,
          agentName: m.from_agent === "user" ? undefined : m.from_agent,
          content: m.text || "",
          timestamp: m.timestamp || "",
        }));
        setMessages(mapped);
        // Map Supabase task rows
        const rawTasks = data.tasks || [];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const mappedTasks: Task[] = rawTasks.map((t: any) => ({
          id: String(t.task_id || t.id),
          sessionId: t.session_id || sessionId,
          description: t.subject || "",
          status: t.status || "pending",
          assignedTo: t.owner || undefined,
        }));
        setTasks(mappedTasks);
        setStatus(data.session?.status || "");
      } catch {
        // Failed to load session
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [sessionId, session]);

  return (
    <div className="h-screen flex flex-col">
      <TopBar />

      <div className="flex-1 flex">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto border-r border-mid/15">
          <div className="px-4 py-3 border-b border-mid/15 flex items-center gap-3">
            <button onClick={() => router.back()} className="text-mid hover:text-fg transition-colors">
              <ArrowLeft className="h-4 w-4" />
            </button>
            <span className="text-xs font-medium text-fg">
              Session {sessionId.slice(0, 8)}
            </span>
            <span className="text-[11px] text-mid">{status}</span>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64 text-sm text-mid">
              Loading...
            </div>
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center h-64 text-sm text-mid/60">
              No messages in this session
            </div>
          ) : (
            messages.map((msg) => <ChatMessage key={msg.id} message={msg} />)
          )}
        </div>

        {/* Tasks sidebar */}
        <div className="w-72 shrink-0 bg-surface overflow-y-auto">
          <div className="px-4 py-3 border-b border-mid/15">
            <span className="text-xs font-medium text-fg">Tasks</span>
          </div>

          {tasks.length === 0 ? (
            <div className="px-4 py-3 text-xs text-mid/60">No tasks</div>
          ) : (
            <div className="p-3 space-y-1">
              {tasks.map((task) => (
                <div key={task.id} className="flex items-start gap-2 text-xs py-1">
                  <span className="shrink-0 mt-0.5">
                    {task.status === "completed" && <span className="text-success">✓</span>}
                    {task.status === "in_progress" && <span className="text-working">◐</span>}
                    {task.status === "pending" && <span className="text-mid">○</span>}
                    {task.status === "failed" && <span className="text-error">✗</span>}
                  </span>
                  <div className="min-w-0">
                    <p className="font-light text-fg">{task.description}</p>
                    {task.assignedTo && (
                      <p className="text-[10px] text-mid">{task.assignedTo}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
