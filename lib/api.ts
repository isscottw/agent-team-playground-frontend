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
  createSession(config: unknown, token?: string) {
    return apiFetch<{ id: string }>("/api/sessions", {
      method: "POST",
      body: JSON.stringify(config),
      token,
    });
  },

  startSession(sessionId: string, token?: string) {
    return apiFetch<{ status: string }>(`/api/sessions/${sessionId}/start`, {
      method: "POST",
      token,
    });
  },

  stopSession(sessionId: string, token?: string) {
    return apiFetch<{ status: string }>(`/api/sessions/${sessionId}/stop`, {
      method: "POST",
      token,
    });
  },

  sendMessage(sessionId: string, content: string, token?: string) {
    return apiFetch<{ id: string }>(`/api/sessions/${sessionId}/messages`, {
      method: "POST",
      body: JSON.stringify({ content }),
      token,
    });
  },

  getSessions(token?: string) {
    return apiFetch<{ id: string; status: string; createdAt: string }[]>(
      "/api/sessions",
      { token }
    );
  },

  getSession(sessionId: string, token?: string) {
    return apiFetch<{ id: string; status: string; messages: unknown[]; tasks: unknown[] }>(
      `/api/sessions/${sessionId}`,
      { token }
    );
  },

  getStreamUrl(sessionId: string) {
    return `${BASE_URL}/api/sessions/${sessionId}/stream`;
  },
};
