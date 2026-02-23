"use client";

import { useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Check, X, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import type { Provider } from "@/types";

interface ApiKeyInputProps {
  provider: Provider;
  label: string;
  recommended?: boolean;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function ApiKeyInput({
  provider,
  label,
  recommended,
  value,
  onChange,
  placeholder,
}: ApiKeyInputProps) {
  const [testStatus, setTestStatus] = useState<"idle" | "testing" | "success" | "error">("idle");

  const handleTest = useCallback(async () => {
    if (!value && provider !== "ollama") return;
    setTestStatus("testing");

    try {
      const result = await api.testLLMKey(provider, value || "");
      setTestStatus(result.status === "valid" ? "success" : "error");
    } catch {
      setTestStatus("error");
    }

    setTimeout(() => setTestStatus("idle"), 3000);
  }, [value, provider]);

  return (
    <div className="flex items-center gap-3">
      <div className="w-28 shrink-0">
        <span className="text-sm text-fg font-normal">{label}</span>
        {recommended && (
          <span className="text-[10px] text-mid ml-1">(rec.)</span>
        )}
      </div>

      <Input
        type={provider === "ollama" ? "url" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || `Enter ${label} key`}
        className="flex-1 font-mono text-xs"
      />

      <Button
        variant="outline"
        size="sm"
        onClick={handleTest}
        disabled={(!value && provider !== "ollama") || testStatus === "testing"}
        className="w-16 shrink-0"
      >
        {testStatus === "testing" && <Loader2 className="h-3 w-3 animate-spin" />}
        {testStatus === "success" && <Check className="h-3 w-3 text-success" />}
        {testStatus === "error" && <X className="h-3 w-3 text-error" />}
        {testStatus === "idle" && "Test"}
      </Button>
    </div>
  );
}
