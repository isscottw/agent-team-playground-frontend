# Agent Team Playground — Frontend

Visual canvas for designing and running multi-agent LLM teams. Draw agent hierarchies on an Excalidraw canvas, configure models and prompts, then watch agents collaborate in real-time.

**Live:** [agent-team-playground-frontend.vercel.app](https://agent-team-playground-frontend.vercel.app)

**Backend repo:** [agent-team-playground-backend](https://github.com/isscottw/agent-team-playground-backend)

## Tech Stack

- Next.js 16, React 19, Tailwind v4
- Excalidraw for the agent design canvas
- Radix UI for dialogs and UI primitives
- Supabase client for session history
- SSE (EventSource) for real-time streaming

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3001](http://localhost:3001).

### Environment Variables

Create `.env.local`:

```
NEXT_PUBLIC_BACKEND_URL=http://localhost:8080
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## How It Works

1. **Design** — Draw agent nodes (rectangles) and connections (arrows) on the Excalidraw canvas. Click agents to configure their name, role, model, and system prompt.
2. **Configure** — Set API keys in the settings modal (persisted in localStorage).
3. **Run** — Click "Run" to start the team. Agents communicate via a filesystem-based inbox system on the backend, with real-time updates streamed to the UI via SSE.
4. **Review** — Browse past sessions in the history modal.

## Deployment

Deployed on [Vercel](https://vercel.com). Push to `main` to trigger a new deployment (requires GitHub integration in Vercel settings).

```bash
vercel --prod
```
