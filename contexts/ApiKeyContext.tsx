"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import type { Provider } from "@/types";

interface ApiKeyContextType {
  keys: Record<Provider, string>;
  setKey: (provider: Provider, key: string) => void;
  getKey: (provider: Provider) => string;
  hasKey: (provider: Provider) => boolean;
  clearKeys: () => void;
}

const emptyKeys: Record<Provider, string> = {
  anthropic: "",
  openai: "",
  kimi: "",
  ollama: "",
};

const STORAGE_KEY = "agent-team-api-keys";

function loadKeys(): Record<Provider, string> {
  if (typeof window === "undefined") return { ...emptyKeys };
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return { ...emptyKeys, ...parsed };
    }
  } catch {
    // Ignore parse errors
  }
  return { ...emptyKeys };
}

const ApiKeyContext = createContext<ApiKeyContextType | undefined>(undefined);

export function ApiKeyProvider({ children }: { children: ReactNode }) {
  const [keys, setKeys] = useState<Record<Provider, string>>(loadKeys);

  const setKey = useCallback((provider: Provider, key: string) => {
    setKeys((prev) => {
      const next = { ...prev, [provider]: key };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // Ignore storage errors
      }
      return next;
    });
  }, []);

  const getKey = useCallback(
    (provider: Provider) => keys[provider] || "",
    [keys]
  );

  const hasKey = useCallback(
    (provider: Provider) => !!keys[provider],
    [keys]
  );

  const clearKeys = useCallback(() => {
    setKeys({ ...emptyKeys });
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore
    }
  }, []);

  return (
    <ApiKeyContext.Provider value={{ keys, setKey, getKey, hasKey, clearKeys }}>
      {children}
    </ApiKeyContext.Provider>
  );
}

export function useApiKeys() {
  const context = useContext(ApiKeyContext);
  if (!context) throw new Error("useApiKeys must be used within ApiKeyProvider");
  return context;
}
