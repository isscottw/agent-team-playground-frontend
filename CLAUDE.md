# Agent Team Playground — Frontend

## Overview

Multi-agent team playground — visual Excalidraw canvas for designing agent hierarchies, real-time execution view.

## Tech Stack

- Next.js 16, React 19, Tailwind v4
- Excalidraw (canvas editor)
- Supabase client (auth)
- react-markdown, Radix UI

## Dev Commands

- `npm run dev` — starts dev server on port 3001
- `npm run build` — production build
- `npm run lint` — run linter

## Environment Variables

- `NEXT_PUBLIC_BACKEND_URL` — backend API base URL
- `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase anonymous key

## Architecture

- **State**: `TeamContext` (useReducer) — manages mode, agents, messages, tasks, agentStates
- **Canvas**: `useExcalidraw` hook manages Excalidraw API, parses elements into agents with connections
- **Streaming**: `useSessionStream` connects SSE to backend, dispatches events to TeamContext
- **Parsing**: `parseExcalidraw.ts` extracts agents (rectangles) and connections (arrows) from canvas
- **Types**: `AgentRole` (leader/teammate), `Agent`, `ParsedAgent`, `ParsedConnection`

## Key Directories

- `components/canvas/` — Excalidraw canvas wrapper, toolbar, agent config panel
- `components/chat/` — chat input, message rendering
- `components/activity/` — activity panel, task list, agent status
- `hooks/` — custom hooks (useExcalidraw, useSessionStream)
- `contexts/` — React contexts (TeamContext, ApiKeyContext, AuthContext)
- `lib/` — utilities, API client, Excalidraw parsing

## Styling

- CSS variables defined in `globals.css`
- `cn()` utility (clsx + tailwind-merge) for conditional classes
- CVA for button variants
- Minimal, clean aesthetic with subtle borders and muted colors

## Deployment

- Target: Vercel
