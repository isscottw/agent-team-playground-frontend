"use client";

import { useCallback } from "react";
import { TeamProvider, useTeam } from "@/contexts/TeamContext";
import { TopBar } from "@/components/TopBar";
import { AgentCanvas } from "@/components/canvas/AgentCanvas";
import { AgentProperties } from "@/components/canvas/AgentProperties";
import { CanvasToolbar } from "@/components/canvas/CanvasToolbar";
import { ChatPanel } from "@/components/chat/ChatPanel";
import { ActivityPanel } from "@/components/activity/ActivityPanel";
import { useExcalidraw } from "@/hooks/useExcalidraw";
import { useSessionStream } from "@/hooks/useSessionStream";

function TeamContent() {
  const { state } = useTeam();
  const excalidraw = useExcalidraw();

  // Connect to SSE stream when running
  useSessionStream(state.mode === "running" ? state.sessionId : null);

  const handleImport = useCallback(
    (elements: unknown[]) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      excalidraw.handleElementsChange(elements as any[]);
    },
    [excalidraw]
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
        <div className="flex-1 flex flex-col relative">
          <CanvasToolbar onImport={handleImport} onExport={handleExport} />
          <AgentCanvas excalidraw={excalidraw} />
          <AgentProperties excalidraw={excalidraw} />
        </div>
      ) : (
        // Run mode: split layout
        <div className="flex-1 flex">
          <div className="flex-1 border-r border-mid/15 flex flex-col min-w-0">
            <ChatPanel />
          </div>
          <div className="w-80 shrink-0 bg-surface">
            <ActivityPanel />
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
