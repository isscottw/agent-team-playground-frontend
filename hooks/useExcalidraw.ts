"use client";

import { useState, useCallback } from "react";
import { parseExcalidrawScene, agentIdsFromParsed } from "@/lib/parseExcalidraw";
import { useTeam } from "@/contexts/TeamContext";
import type { Agent, Provider } from "@/types";

export function useExcalidraw() {
  const { state, dispatch } = useTeam();
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);

  const handleElementsChange = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (elements: any[]) => {
      dispatch({ type: "SET_EXCALIDRAW_ELEMENTS", elements });

      const parsed = parseExcalidrawScene(elements);
      const existingAgents = state.agents;

      // Merge parsed agents with existing config
      const agents: Agent[] = parsed.agents.map((pa) => {
        const existing = existingAgents.find((a) => a.id === pa.id);
        const connections = agentIdsFromParsed(parsed, pa.id);
        return {
          id: pa.id,
          name: pa.name,
          provider: existing?.provider || ("anthropic" as Provider),
          model: existing?.model || "claude-sonnet-4-20250514",
          systemPrompt: existing?.systemPrompt || "",
          connections,
          x: pa.x,
          y: pa.y,
          width: pa.width,
          height: pa.height,
        };
      });

      dispatch({ type: "SET_AGENTS", agents });
    },
    [dispatch, state.agents]
  );

  const getSelectedAgent = useCallback((): Agent | null => {
    if (!selectedElementId) return null;
    return state.agents.find((a) => a.id === selectedElementId) || null;
  }, [selectedElementId, state.agents]);

  const updateAgentConfig = useCallback(
    (agentId: string, updates: Partial<Agent>) => {
      const agent = state.agents.find((a) => a.id === agentId);
      if (!agent) return;
      dispatch({ type: "UPDATE_AGENT", agent: { ...agent, ...updates } });
    },
    [state.agents, dispatch]
  );

  return {
    elements: state.excalidrawElements,
    selectedElementId,
    setSelectedElementId,
    handleElementsChange,
    getSelectedAgent,
    updateAgentConfig,
  };
}
