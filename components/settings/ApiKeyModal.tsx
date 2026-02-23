"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ApiKeyInput } from "./ApiKeyInput";
import { useApiKeys } from "@/contexts/ApiKeyContext";
import type { Provider } from "@/types";

interface ApiKeyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const providers: { id: Provider; label: string; recommended?: boolean; placeholder?: string }[] = [
  { id: "anthropic", label: "Anthropic", recommended: true, placeholder: "sk-ant-..." },
  { id: "openai", label: "OpenAI", placeholder: "sk-..." },
  { id: "kimi", label: "Kimi K2", placeholder: "Enter Kimi API key" },
  { id: "ollama", label: "Ollama", placeholder: "http://localhost:11434" },
];

export function ApiKeyModal({ open, onOpenChange }: ApiKeyModalProps) {
  const { keys, setKey } = useApiKeys();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>API Keys</DialogTitle>
          <DialogDescription>
            Keys are stored locally in your browser and never sent to our servers.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 mt-2">
          {providers.map((p) => (
            <ApiKeyInput
              key={p.id}
              provider={p.id}
              label={p.label}
              recommended={p.recommended}
              value={keys[p.id]}
              onChange={(val) => setKey(p.id, val)}
              placeholder={p.placeholder}
            />
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
