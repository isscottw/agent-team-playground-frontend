import type { ParsedTeam, ParsedAgent, ParsedConnection } from "@/types";

interface ExcalidrawElement {
  id: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  boundElements?: { id: string; type: string }[] | null;
  // Text elements bound to shapes
  containerId?: string | null;
  text?: string;
  // Arrow-specific
  startBinding?: { elementId: string } | null;
  endBinding?: { elementId: string } | null;
  isDeleted?: boolean;
}

export function parseExcalidrawScene(elements: ExcalidrawElement[]): ParsedTeam {
  const activeElements = elements.filter((el) => !el.isDeleted);

  // Find rectangles (agents)
  const rectangles = activeElements.filter(
    (el) => el.type === "rectangle" || el.type === "diamond" || el.type === "ellipse"
  );

  // Find text elements to get names
  const textElements = activeElements.filter((el) => el.type === "text");

  // Build agent list
  const agents: ParsedAgent[] = rectangles.map((rect) => {
    // Find bound text element for the name
    const boundText = textElements.find((t) => t.containerId === rect.id);
    const name = boundText?.text || `Agent ${rect.id.slice(0, 4)}`;

    return {
      id: rect.id,
      name: name.trim(),
      x: rect.x,
      y: rect.y,
      width: rect.width,
      height: rect.height,
    };
  });

  // Find arrows (connections)
  const arrows = activeElements.filter((el) => el.type === "arrow");
  const agentIds = new Set(rectangles.map((r) => r.id));

  const connections: ParsedConnection[] = arrows
    .filter(
      (arrow) =>
        arrow.startBinding?.elementId &&
        arrow.endBinding?.elementId &&
        agentIds.has(arrow.startBinding.elementId) &&
        agentIds.has(arrow.endBinding.elementId)
    )
    .map((arrow) => ({
      fromId: arrow.startBinding!.elementId,
      toId: arrow.endBinding!.elementId,
    }));

  return { agents, connections };
}

export function agentIdsFromParsed(parsed: ParsedTeam, agentId: string): string[] {
  return parsed.connections
    .filter((c) => c.fromId === agentId || c.toId === agentId)
    .map((c) => (c.fromId === agentId ? c.toId : c.fromId));
}
