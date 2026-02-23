"use client";

import dynamic from "next/dynamic";
import { useCallback, useRef } from "react";
import type { useExcalidraw } from "@/hooks/useExcalidraw";
import "@excalidraw/excalidraw/index.css";

const Excalidraw = dynamic(
  async () => (await import("@excalidraw/excalidraw")).Excalidraw,
  { ssr: false, loading: () => <div className="flex-1 flex items-center justify-center text-mid text-sm">Loading canvas...</div> }
);

interface AgentCanvasProps {
  excalidraw: ReturnType<typeof useExcalidraw>;
}

export function AgentCanvas({ excalidraw }: AgentCanvasProps) {
  const handleElementsChangeRef = useRef(excalidraw.handleElementsChange);
  handleElementsChangeRef.current = excalidraw.handleElementsChange;

  const setSelectedRef = useRef(excalidraw.setSelectedElementId);
  setSelectedRef.current = excalidraw.setSelectedElementId;

  const handleChange = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (elements: readonly any[]) => {
      handleElementsChangeRef.current([...elements]);
    },
    []
  );

  const handlePointerDown = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (_activeTool: any, pointerDownState: any) => {
      const hit = pointerDownState?.hit?.element;
      if (hit && (hit.type === "rectangle" || hit.type === "diamond" || hit.type === "ellipse")) {
        setSelectedRef.current(hit.id);
      } else {
        setSelectedRef.current(null);
      }
    },
    []
  );

  // Restore previous elements when canvas remounts (e.g., back from run mode)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const initialData = excalidraw.elements.length > 0
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ? { elements: excalidraw.elements as any[] }
    : undefined;

  return (
    <div style={{ width: "100%", height: "100%", position: "absolute", top: 0, left: 0 }}>
      <Excalidraw
        initialData={initialData}
        onChange={handleChange}
        onPointerDown={handlePointerDown}
        excalidrawAPI={excalidraw.setExcalidrawAPI}
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
