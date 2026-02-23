"use client";

import { Upload, Download, Play, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTeam } from "@/contexts/TeamContext";
import { useApiKeys } from "@/contexts/ApiKeyContext";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useCallback, useRef } from "react";

interface CanvasToolbarProps {
  onImport: (elements: unknown[]) => void;
  onExport: () => void;
}

export function CanvasToolbar({ onImport, onExport }: CanvasToolbarProps) {
  const { state, dispatch, setMode } = useTeam();
  const { keys } = useApiKeys();
  const { session } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImport = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target?.result as string);
          if (data.elements) {
            onImport(data.elements);
          }
        } catch {
          // Invalid file
        }
      };
      reader.readAsText(file);
      e.target.value = "";
    },
    [onImport]
  );

  const handleRun = useCallback(async () => {
    if (state.agents.length === 0) return;

    // Build request matching backend's SessionRequest model
    const requestBody = {
      agents: state.agents.map((a) => ({
        name: a.name,
        role: a.role || "teammate",
        provider: a.provider,
        model: a.model,
        system_prompt: a.systemPrompt || "You are a helpful AI assistant.",
        connections: a.connections,
      })),
      connections: [] as string[][],
      api_keys: keys,
    };

    try {
      const result = await api.createSession(requestBody, session?.access_token);
      dispatch({ type: "SET_SESSION_ID", sessionId: result.session_id });
      setMode("running");
    } catch (err) {
      console.error("Failed to start session:", err);
    }
  }, [state.agents, keys, session, dispatch, setMode]);

  const handleStop = useCallback(async () => {
    if (!state.sessionId) return;
    try {
      await api.stopSession(state.sessionId, session?.access_token);
      setMode("stopped");
    } catch (err) {
      console.error("Failed to stop session:", err);
    }
  }, [state.sessionId, session, setMode]);

  const isRunning = state.mode === "running";

  return (
    <div className="flex items-center gap-2 px-4 py-2 border-b border-mid/15 bg-surface">
      <input
        ref={fileInputRef}
        type="file"
        accept=".excalidraw,.json"
        onChange={handleFileChange}
        className="hidden"
      />

      <Button variant="ghost" size="sm" onClick={handleImport}>
        <Upload className="h-3.5 w-3.5 mr-1.5" />
        Import
      </Button>

      <Button variant="ghost" size="sm" onClick={onExport}>
        <Download className="h-3.5 w-3.5 mr-1.5" />
        Export
      </Button>

      <div className="flex-1" />

      {state.agents.length > 0 && (
        <span className="text-xs text-mid mr-2">
          {state.agents.length} agent{state.agents.length !== 1 ? "s" : ""}
        </span>
      )}

      {isRunning ? (
        <Button size="sm" variant="outline" onClick={handleStop}>
          <Square className="h-3 w-3 mr-1.5" />
          Stop
        </Button>
      ) : (
        <Button
          size="sm"
          onClick={handleRun}
          disabled={state.agents.length === 0}
        >
          <Play className="h-3 w-3 mr-1.5" />
          Run
        </Button>
      )}
    </div>
  );
}
