"use client";

import { useState, useEffect } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { useExcalidraw } from "@/hooks/useExcalidraw";
import type { Provider } from "@/types";

const PROVIDERS: { value: Provider; label: string }[] = [
  { value: "anthropic", label: "Anthropic" },
  { value: "openai", label: "OpenAI" },
  { value: "kimi", label: "Kimi K2" },
  { value: "ollama", label: "Ollama" },
];

const MODELS: Record<Provider, string[]> = {
  anthropic: ["claude-sonnet-4-20250514", "claude-opus-4-20250514", "claude-haiku-4-20250506"],
  openai: ["gpt-4o", "gpt-4o-mini", "o1-preview"],
  kimi: ["k2-chat"],
  ollama: ["llama3", "mistral", "codellama"],
};

interface AgentPropertiesProps {
  excalidraw: ReturnType<typeof useExcalidraw>;
}

export function AgentProperties({ excalidraw }: AgentPropertiesProps) {
  const { getSelectedAgent, updateAgentConfig, selectedElementId } = excalidraw;
  const [collapsed, setCollapsed] = useState(true);

  const agent = getSelectedAgent();

  const [name, setName] = useState("");
  const [provider, setProvider] = useState<Provider>("anthropic");
  const [model, setModel] = useState("");
  const [systemPrompt, setSystemPrompt] = useState("");

  useEffect(() => {
    if (agent) {
      setName(agent.name);
      setProvider(agent.provider);
      setModel(agent.model);
      setSystemPrompt(agent.systemPrompt);
      setCollapsed(false);
    } else {
      setCollapsed(true);
    }
  }, [agent, selectedElementId]);

  if (!agent) return null;

  const handleSave = () => {
    updateAgentConfig(agent.id, {
      name,
      provider,
      model,
      systemPrompt,
    });
  };

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-surface border-t border-mid/15 z-10">
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="w-full flex items-center justify-between px-4 py-2 text-xs text-mid hover:text-fg transition-colors cursor-pointer"
      >
        <span className="font-medium text-fg">{agent.name}</span>
        {collapsed ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
      </button>

      {!collapsed && (
        <div className="px-4 pb-4 space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] text-mid mb-1 block">Name</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <label className="text-[11px] text-mid mb-1 block">Provider</label>
              <select
                value={provider}
                onChange={(e) => {
                  const p = e.target.value as Provider;
                  setProvider(p);
                  setModel(MODELS[p][0]);
                }}
                className="flex h-9 w-full bg-transparent border border-mid/20 px-3 py-1 text-sm font-light text-fg focus:outline-none focus:border-mid/50 transition-colors cursor-pointer"
              >
                {PROVIDERS.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[11px] text-mid mb-1 block">Model</label>
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="flex h-9 w-full bg-transparent border border-mid/20 px-3 py-1 text-sm font-light text-fg focus:outline-none focus:border-mid/50 transition-colors cursor-pointer"
              >
                {MODELS[provider].map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-[11px] text-mid mb-1 block">System Prompt</label>
            <textarea
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              rows={3}
              className="w-full bg-transparent border border-mid/20 px-3 py-2 text-sm font-light text-fg placeholder:text-mid/60 focus:outline-none focus:border-mid/50 transition-colors resize-none"
              placeholder="Enter system instructions for this agent..."
            />
          </div>

          <div className="flex justify-end">
            <Button size="sm" onClick={handleSave}>
              Save
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
