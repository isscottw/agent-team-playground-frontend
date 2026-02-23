export type Provider = "anthropic" | "openai" | "kimi" | "ollama";

export type AgentRole = "leader" | "teammate";

export interface Agent {
  id: string;
  name: string;
  role: AgentRole;
  provider: Provider;
  model: string;
  systemPrompt: string;
  connections: string[]; // IDs of connected agents
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}

export interface Team {
  id?: string;
  name: string;
  agents: Agent[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Message {
  id: string;
  sessionId: string;
  role: "user" | "agent" | "system";
  agentName?: string;
  content: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface Task {
  id: string;
  sessionId: string;
  description: string;
  status: "pending" | "in_progress" | "completed" | "failed";
  assignedTo?: string;
  result?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SessionConfig {
  id?: string;
  teamConfig: Team;
  apiKeys: Record<Provider, string>;
  status: "created" | "running" | "stopped" | "completed" | "error";
  createdAt?: string;
}

export interface ParsedAgent {
  id: string;
  name: string;
  role: AgentRole;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ParsedConnection {
  fromId: string;
  toId: string;
}

export interface ParsedTeam {
  agents: ParsedAgent[];
  connections: ParsedConnection[];
}

export type SSEEventType =
  | "message"
  | "task_update"
  | "agent_state"
  | "session_status"
  | "error";

export interface SSEEvent {
  type: SSEEventType;
  data: Message | Task | AgentState | SessionStatus | ErrorEvent;
}

export interface AgentState {
  agentName: string;
  state: "idle" | "working" | "blocked";
  currentTask?: string;
}

export interface SessionStatus {
  sessionId: string;
  status: SessionConfig["status"];
}

export interface ErrorEvent {
  message: string;
  code?: string;
}

export type TeamMode = "design" | "running" | "stopped";
