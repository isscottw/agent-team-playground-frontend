"use client";

import dynamic from "next/dynamic";
import { useCallback } from "react";
import type { useExcalidraw } from "@/hooks/useExcalidraw";

const Excalidraw = dynamic(
  async () => (await import("@excalidraw/excalidraw")).Excalidraw,
  { ssr: false }
);

interface AgentCanvasProps {
  excalidraw: ReturnType<typeof useExcalidraw>;
}

export function AgentCanvas({ excalidraw }: AgentCanvasProps) {
  const { handleElementsChange, setSelectedElementId } = excalidraw;

  const handleChange = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (elements: readonly any[]) => {
      handleElementsChange([...elements]);
    },
    [handleElementsChange]
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handlePointerUpdate = useCallback((payload: any) => {
    // Not used for selection; using onPointerDown instead
    void payload;
  }, []);

  return (
    <div className="flex-1 relative bg-surface">
      <Excalidraw
        onChange={handleChange}
        onPointerUpdate={handlePointerUpdate}
        onPointerDown={(_activeTool, pointerDownState) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const hit = (pointerDownState as any)?.hit?.element;
          if (hit && (hit.type === "rectangle" || hit.type === "diamond" || hit.type === "ellipse")) {
            setSelectedElementId(hit.id);
          } else {
            setSelectedElementId(null);
          }
        }}
        UIOptions={{
          canvasActions: {
            changeViewBackgroundColor: false,
            export: false,
            loadScene: false,
            saveToActiveFile: false,
            toggleTheme: false,
          },
        }}
        theme="light"
      />
    </div>
  );
}
