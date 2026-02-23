"use client";

import { useState, useCallback, useRef } from "react";
import { parseExcalidrawScene, agentIdsFromParsed } from "@/lib/parseExcalidraw";
import { useTeam } from "@/contexts/TeamContext";
import type { Agent, AgentRole, Provider } from "@/types";

const ROLE_STYLES: Record<AgentRole, { backgroundColor: string; strokeColor: string }> = {
  leader: { backgroundColor: "#fef3c7", strokeColor: "#d97706" },
  teammate: { backgroundColor: "#dbeafe", strokeColor: "#2563eb" },
};

export function useExcalidraw() {
  const { state, dispatch } = useTeam();
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const agentsRef = useRef<Agent[]>(state.agents);
  agentsRef.current = state.agents;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const excalidrawAPIRef = useRef<any>(null);

  const setExcalidrawAPI = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (api: any) => {
      excalidrawAPIRef.current = api;
    },
    []
  );

  const handleElementsChange = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (elements: any[]) => {
      const parsed = parseExcalidrawScene(elements);
      const existingAgents = agentsRef.current;

      // Build id→name lookup for connection mapping
      const idToName = new Map(parsed.agents.map((a) => [a.id, a.name]));

      const agents: Agent[] = parsed.agents.map((pa) => {
        const existing = existingAgents.find((a) => a.id === pa.id);
        // Convert element IDs to agent names for the backend
        const connectionIds = agentIdsFromParsed(parsed, pa.id);
        const connections = connectionIds
          .map((cid) => idToName.get(cid))
          .filter((n): n is string => !!n);
        return {
          id: pa.id,
          name: pa.name,
          role: existing?.role || pa.role || ("teammate" as AgentRole),
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
      dispatch({ type: "SET_EXCALIDRAW_ELEMENTS", elements });
    },
    [dispatch]
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

  const updateElementStyle = useCallback(
    (elementId: string, role: AgentRole) => {
      const api = excalidrawAPIRef.current;
      if (!api) return;

      const elements = api.getSceneElements();
      const styles = ROLE_STYLES[role];

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const updated = elements.map((el: any) => {
        if (el.id === elementId) {
          return {
            ...el,
            backgroundColor: styles.backgroundColor,
            strokeColor: styles.strokeColor,
            version: (el.version || 0) + 1,
          };
        }
        return el;
      });

      api.updateScene({ elements: updated });
    },
    []
  );

  const importScene = useCallback(
    (elements: unknown[]) => {
      const api = excalidrawAPIRef.current;
      if (api) {
        // Update the live Excalidraw canvas
        api.updateScene({ elements });
      }
      // Also parse into our agent state
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      handleElementsChange(elements as any[]);
    },
    [handleElementsChange]
  );

  return {
    elements: state.excalidrawElements,
    selectedElementId,
    setSelectedElementId,
    handleElementsChange,
    getSelectedAgent,
    updateAgentConfig,
    setExcalidrawAPI,
    updateElementStyle,
    importScene,
  };
}
