"use client";

import { useCallback } from "react";
import { ArrowLeft, Square } from "lucide-react";
import { TeamProvider, useTeam } from "@/contexts/TeamContext";
import { TopBar } from "@/components/TopBar";
import { AgentCanvas } from "@/components/canvas/AgentCanvas";
import { AgentProperties } from "@/components/canvas/AgentProperties";
import { CanvasToolbar } from "@/components/canvas/CanvasToolbar";
import { ChatPanel } from "@/components/chat/ChatPanel";
import { ActivityPanel } from "@/components/activity/ActivityPanel";
import { Button } from "@/components/ui/button";
import { useExcalidraw } from "@/hooks/useExcalidraw";
import { useSessionStream } from "@/hooks/useSessionStream";
import { useApiKeys } from "@/contexts/ApiKeyContext";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";

function RunToolbar() {
  const { state, setMode } = useTeam();
  const { session } = useAuth();

  const handleStop = useCallback(async () => {
    if (state.sessionId) {
      try {
        await api.stopSession(state.sessionId, session?.access_token);
      } catch (err) {
        console.error("Failed to stop session:", err);
      }
    }
    setMode("stopped");
  }, [state.sessionId, session, setMode]);

  const handleBack = useCallback(() => {
    setMode("design");
  }, [setMode]);

  const isRunning = state.mode === "running";

  return (
    <div className="flex items-center gap-2 px-4 py-2 border-b border-mid/15 bg-surface shrink-0">
      <Button variant="ghost" size="sm" onClick={handleBack}>
        <ArrowLeft className="h-3.5 w-3.5 mr-1.5" />
        Back to Canvas
      </Button>
      <div className="flex-1" />
      <span className="text-xs text-mid mr-2">
        {state.agents.length} agent{state.agents.length !== 1 ? "s" : ""}
        {isRunning ? " · running" : " · stopped"}
      </span>
      {isRunning && (
        <Button size="sm" variant="outline" onClick={handleStop}>
          <Square className="h-3 w-3 mr-1.5" />
          Stop
        </Button>
      )}
    </div>
  );
}

function TeamContent() {
  const { state } = useTeam();
  const excalidraw = useExcalidraw();

  // Connect to SSE stream when running
  useSessionStream(state.mode === "running" ? state.sessionId : null);

  const handleImport = useCallback(
    (elements: unknown[]) => {
      // Update the Excalidraw canvas via API
      excalidraw.importScene(elements);
    },
    [excalidraw.importScene]
  );

  const handleExport = useCallback(() => {
    const data = JSON.stringify(
      { type: "excalidraw", version: 2, elements: excalidraw.elements },
      null,
      2
    );
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "agent-team.excalidraw";
    a.click();
    URL.revokeObjectURL(url);
  }, [excalidraw.elements]);

  const isDesign = state.mode === "design";

  return (
    <div className="h-screen flex flex-col">
      <TopBar />

      {isDesign ? (
        // Design mode: full canvas
        <div className="flex-1 flex flex-col min-h-0">
          <CanvasToolbar onImport={handleImport} onExport={handleExport} />
          <div className="flex-1 relative min-h-0">
            <AgentCanvas excalidraw={excalidraw} />
          </div>
          <AgentProperties excalidraw={excalidraw} />
        </div>
      ) : (
        // Run mode: split layout
        <div className="flex-1 flex flex-col min-h-0">
          <RunToolbar />
          <div className="flex-1 flex min-h-0">
            <div className="flex-1 border-r border-mid/15 flex flex-col min-w-0 min-h-0">
              <ChatPanel />
            </div>
            <div className="w-80 shrink-0 bg-surface flex flex-col min-h-0">
              <ActivityPanel />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TeamPage() {
  return (
    <TeamProvider>
      <TeamContent />
    </TeamProvider>
  );
}
