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

const ApiKeyContext = createContext<ApiKeyContextType | undefined>(undefined);

export function ApiKeyProvider({ children }: { children: ReactNode }) {
  const [keys, setKeys] = useState<Record<Provider, string>>({ ...emptyKeys });

  const setKey = useCallback((provider: Provider, key: string) => {
    setKeys((prev) => ({ ...prev, [provider]: key }));
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
