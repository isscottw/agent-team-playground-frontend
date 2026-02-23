"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { TopBar } from "@/components/TopBar";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { ArrowLeft } from "lucide-react";

interface SessionSummary {
  id: string;
  status: string;
  created_at: string;
}

export default function HistoryPage() {
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const { session } = useAuth();
  const router = useRouter();

  useEffect(() => {
    async function load() {
      try {
        const data = await api.getHistory(session?.access_token);
        setSessions(data.sessions as SessionSummary[]);
      } catch {
        // Failed to load sessions
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [session]);

  return (
    <div className="h-screen flex flex-col">
      <TopBar />

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-6 py-8">
          <div className="flex items-center gap-3 mb-6">
            <button onClick={() => router.back()} className="text-mid hover:text-fg transition-colors">
              <ArrowLeft className="h-4 w-4" />
            </button>
            <h1 className="text-base font-medium text-fg">Session History</h1>
          </div>

          {loading ? (
            <p className="text-sm text-mid font-light">Loading...</p>
          ) : sessions.length === 0 ? (
            <p className="text-sm text-mid font-light">No sessions yet.</p>
          ) : (
            <div className="space-y-2">
              {sessions.map((s) => (
                <Link
                  key={s.id}
                  href={`/history/${s.id}`}
                  className="flex items-center justify-between p-3 border border-mid/15 hover:border-mid/30 transition-colors group"
                >
                  <div>
                    <span className="text-sm font-normal text-fg group-hover:text-hover transition-colors">
                      Session {s.id.slice(0, 8)}
                    </span>
                    <span className="text-[11px] text-mid ml-3">
                      {new Date(s.created_at).toLocaleDateString()} {new Date(s.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  <span className="text-[11px] text-mid">{s.status}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
