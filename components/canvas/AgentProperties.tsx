"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronDown, ChevronUp, Crown, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import type { useExcalidraw } from "@/hooks/useExcalidraw";
import type { AgentRole, Provider } from "@/types";

const PROVIDERS: { value: Provider; label: string }[] = [
  { value: "anthropic", label: "Anthropic" },
  { value: "openai", label: "OpenAI" },
  { value: "kimi", label: "Kimi K2" },
  { value: "ollama", label: "Ollama" },
];

const MODELS: Record<Provider, string[]> = {
  anthropic: ["claude-sonnet-4-20250514", "claude-haiku-4-5-20251001"],
  openai: ["gpt-4o", "gpt-5"],
  kimi: ["kimi-k2-0905-preview"],
  ollama: ["llama3.2:3b", "deepseek-r1:8b", "gemma3:1b"],
};

const ROLES: { value: AgentRole; label: string; icon: typeof Crown }[] = [
  { value: "leader", label: "Leader", icon: Crown },
  { value: "teammate", label: "Teammate", icon: Users },
];

interface AgentPropertiesProps {
  excalidraw: ReturnType<typeof useExcalidraw>;
}

export function AgentProperties({ excalidraw }: AgentPropertiesProps) {
  const { getSelectedAgent, updateAgentConfig, updateElementStyle, selectedElementId } = excalidraw;
  const [collapsed, setCollapsed] = useState(true);

  const agent = getSelectedAgent();

  const [name, setName] = useState("");
  const [role, setRole] = useState<AgentRole>("teammate");
  const [provider, setProvider] = useState<Provider>("anthropic");
  const [model, setModel] = useState("");
  const [systemPrompt, setSystemPrompt] = useState("");

  // Ref to track local state for auto-save cleanup
  const localStateRef = useRef({ name, role, provider, model, systemPrompt });
  const prevAgentIdRef = useRef<string | null>(null);

  // Keep ref in sync with local state
  useEffect(() => {
    localStateRef.current = { name, role, provider, model, systemPrompt };
  }, [name, role, provider, model, systemPrompt]);

  // Sync local state from selected agent + auto-save previous on change
  useEffect(() => {
    const prevId = prevAgentIdRef.current;

    // Auto-save previous agent's edits
    if (prevId) {
      updateAgentConfig(prevId, localStateRef.current);
    }

    // Load new agent's data
    if (agent) {
      setName(agent.name);
      setRole(agent.role || "teammate");
      setProvider(agent.provider);
      setModel(agent.model);
      setSystemPrompt(agent.systemPrompt);
      setCollapsed(false);
    } else {
      setCollapsed(true);
    }

    prevAgentIdRef.current = agent?.id ?? null;

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedElementId]);

  if (!agent) return null;

  const handleRoleChange = (newRole: AgentRole) => {
    setRole(newRole);
    updateElementStyle(agent.id, newRole);
  };

  const selectClass =
    "flex h-9 w-full bg-transparent border border-mid/20 px-3 py-1 text-sm font-light text-fg focus:outline-none focus:border-mid/50 transition-colors cursor-pointer";

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-surface border-t border-mid/15 z-10">
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="w-full flex items-center justify-between px-4 py-2 text-xs text-mid hover:text-fg transition-colors cursor-pointer"
      >
        <span className="font-medium text-fg flex items-center gap-1.5">
          {(role === "leader") ? (
            <Crown className="h-3 w-3 text-amber-600" />
          ) : (
            <Users className="h-3 w-3 text-blue-600" />
          )}
          {agent.name}
          <span className="text-[10px] text-mid font-normal ml-1">
            {role === "leader" ? "Leader" : "Teammate"}
          </span>
        </span>
        {collapsed ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
      </button>

      {!collapsed && (
        <div className="px-4 pb-4 space-y-3">
          <div className="grid grid-cols-4 gap-3">
            <div>
              <label className="text-[11px] text-mid mb-1 block">Name</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <label className="text-[11px] text-mid mb-1 block">Role</label>
              <select
                value={role}
                onChange={(e) => handleRoleChange(e.target.value as AgentRole)}
                className={selectClass}
              >
                {ROLES.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
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
                className={selectClass}
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
                className={selectClass}
              >
                {MODELS[provider].map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-[11px] text-mid mb-1 block">Role / Responsibilities</label>
            <textarea
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              rows={3}
              className="w-full bg-transparent border border-mid/20 px-3 py-2 text-sm font-light text-fg placeholder:text-mid/60 focus:outline-none focus:border-mid/50 transition-colors resize-none"
              placeholder="Describe what this agent should do, e.g. 'You are the project lead. Coordinate tasks and review work from teammates.'"
            />
            <p className="text-[10px] text-mid/60 mt-1">
              Tool instructions are auto-injected — just describe the agent&apos;s role.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
