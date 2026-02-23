const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";

interface FetchOptions extends RequestInit {
  token?: string;
}

async function apiFetch<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const { token, ...fetchOptions } = options;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    ...fetchOptions,
    headers,
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`API error ${res.status}: ${error}`);
  }

  return res.json();
}

export const api = {
  // POST /api/sessions — creates AND starts the session
  createSession(body: { agents: unknown[]; connections?: string[][]; api_keys: Record<string, string> }, token?: string) {
    return apiFetch<{ session_id: string; agents: string[]; status: string }>("/api/sessions", {
      method: "POST",
      body: JSON.stringify(body),
      token,
    });
  },

  // DELETE /api/sessions/{id} — stop + cleanup
  stopSession(sessionId: string, token?: string) {
    return apiFetch<{ status: string }>(`/api/sessions/${sessionId}`, {
      method: "DELETE",
      token,
    });
  },

  // POST /api/sessions/{id}/chat — send user message
  sendMessage(sessionId: string, message: string, token?: string) {
    return apiFetch<{ status: string }>(`/api/sessions/${sessionId}/chat`, {
      method: "POST",
      body: JSON.stringify({ message }),
      token,
    });
  },

  // POST /api/llm/test — validate API key
  testLLMKey(provider: string, apiKey: string, model?: string) {
    return apiFetch<{ status: string; provider: string; error?: string }>("/api/llm/test", {
      method: "POST",
      body: JSON.stringify({ provider, api_key: apiKey, model }),
    });
  },

  // GET /api/models
  getModels() {
    return apiFetch<{ providers: Record<string, unknown[]> }>("/api/models");
  },

  // GET /api/history
  getHistory(token?: string) {
    return apiFetch<{ sessions: unknown[] }>("/api/history", { token });
  },

  // GET /api/history/{id}
  getSessionHistory(sessionId: string, token?: string) {
    return apiFetch<unknown>(`/api/history/${sessionId}`, { token });
  },

  // DELETE /api/history/{id}
  deleteSessionHistory(sessionId: string, token?: string) {
    return apiFetch<{ status: string }>(`/api/history/${sessionId}`, {
      method: "DELETE",
      token,
    });
  },

  // Check if a session is still active on the backend
  async checkSession(sessionId: string): Promise<boolean> {
    try {
      const res = await fetch(`${BASE_URL}/api/sessions/${sessionId}/stream`, {
        method: "HEAD",
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  // SSE stream URL
  getStreamUrl(sessionId: string) {
    return `${BASE_URL}/api/sessions/${sessionId}/stream`;
  },
};
