"use client";

import dynamic from "next/dynamic";
import { useTeam } from "@/contexts/TeamContext";

const Excalidraw = dynamic(
  async () => (await import("@excalidraw/excalidraw")).Excalidraw,
  { ssr: false }
);

export function MiniCanvas() {
  const { state } = useTeam();

  if (state.excalidrawElements.length === 0) return null;

  return (
    <div className="h-48 border border-mid/15 bg-surface overflow-hidden">
      <Excalidraw
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        initialData={{ elements: state.excalidrawElements as any[], appState: { viewBackgroundColor: "#FFFFFF" } }}
        viewModeEnabled={true}
        zenModeEnabled={true}
        gridModeEnabled={false}
        theme="light"
        UIOptions={{
          canvasActions: {
            changeViewBackgroundColor: false,
            export: false,
            loadScene: false,
            saveToActiveFile: false,
            toggleTheme: false,
          },
          tools: { image: false },
        }}
      />
    </div>
  );
}
