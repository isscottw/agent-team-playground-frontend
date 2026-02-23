"use client";

import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  type ReactNode,
  type Dispatch,
} from "react";
import type { Agent, Message, Task, AgentState, TeamMode } from "@/types";

interface TeamState {
  mode: TeamMode;
  agents: Agent[];
  messages: Message[];
  tasks: Task[];
  agentStates: Record<string, AgentState>;
  sessionId: string | null;
  teamName: string;
  excalidrawElements: unknown[];
}

type TeamAction =
  | { type: "SET_MODE"; mode: TeamMode }
  | { type: "SET_AGENTS"; agents: Agent[] }
  | { type: "UPDATE_AGENT"; agent: Agent }
  | { type: "ADD_MESSAGE"; message: Message }
  | { type: "SET_MESSAGES"; messages: Message[] }
  | { type: "UPDATE_TASK"; task: Task }
  | { type: "SET_TASKS"; tasks: Task[] }
  | { type: "SET_AGENT_STATE"; state: AgentState }
  | { type: "SET_SESSION_ID"; sessionId: string | null }
  | { type: "SET_TEAM_NAME"; name: string }
  | { type: "SET_EXCALIDRAW_ELEMENTS"; elements: unknown[] }
  | { type: "RESET" };

const initialState: TeamState = {
  mode: "design",
  agents: [],
  messages: [],
  tasks: [],
  agentStates: {},
  sessionId: null,
  teamName: "Untitled Team",
  excalidrawElements: [],
};

function teamReducer(state: TeamState, action: TeamAction): TeamState {
  switch (action.type) {
    case "SET_MODE":
      return { ...state, mode: action.mode };
    case "SET_AGENTS":
      return { ...state, agents: action.agents };
    case "UPDATE_AGENT": {
      const idx = state.agents.findIndex((a) => a.id === action.agent.id);
      if (idx === -1) return { ...state, agents: [...state.agents, action.agent] };
      const agents = [...state.agents];
      agents[idx] = action.agent;
      return { ...state, agents };
    }
    case "ADD_MESSAGE":
      return { ...state, messages: [...state.messages, action.message] };
    case "SET_MESSAGES":
      return { ...state, messages: action.messages };
    case "UPDATE_TASK": {
      const idx = state.tasks.findIndex((t) => t.id === action.task.id);
      if (idx === -1) return { ...state, tasks: [...state.tasks, action.task] };
      const tasks = [...state.tasks];
      tasks[idx] = action.task;
      return { ...state, tasks };
    }
    case "SET_TASKS":
      return { ...state, tasks: action.tasks };
    case "SET_AGENT_STATE":
      return {
        ...state,
        agentStates: { ...state.agentStates, [action.state.agentName]: action.state },
      };
    case "SET_SESSION_ID":
      return { ...state, sessionId: action.sessionId };
    case "SET_TEAM_NAME":
      return { ...state, teamName: action.name };
    case "SET_EXCALIDRAW_ELEMENTS":
      return { ...state, excalidrawElements: action.elements };
    case "RESET":
      return { ...initialState };
    default:
      return state;
  }
}

interface TeamContextType {
  state: TeamState;
  dispatch: Dispatch<TeamAction>;
  setMode: (mode: TeamMode) => void;
  reset: () => void;
}

const TeamContext = createContext<TeamContextType | undefined>(undefined);

export function TeamProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(teamReducer, initialState);

  const setMode = useCallback(
    (mode: TeamMode) => dispatch({ type: "SET_MODE", mode }),
    [dispatch]
  );

  const reset = useCallback(() => dispatch({ type: "RESET" }), [dispatch]);

  return (
    <TeamContext.Provider value={{ state, dispatch, setMode, reset }}>
      {children}
    </TeamContext.Provider>
  );
}

export function useTeam() {
  const context = useContext(TeamContext);
  if (!context) throw new Error("useTeam must be used within TeamProvider");
  return context;
}

export function useOptionalTeam() {
  return useContext(TeamContext);
}
