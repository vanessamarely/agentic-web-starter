# Agentic Web Starter — Emergency Healthcare & Disaster Relief Platform

A pnpm-workspaces monorepo combining an **offline-first edge triage client**
with a **cloud multi-agent orchestrator**, built for disaster-response
scenarios such as earthquake relief in Colombia.

## Architecture

```
agentic-web-starter/
├── packages/
│   └── shared-types/        Zod schemas + TS types shared by both apps
├── apps/
│   ├── web-client/          React + Vite + Tailwind edge triage console
│   │   ├── src/ai/nano/     Chrome Built-in AI (window.ai) wrapper + offline heuristic
│   │   ├── src/mcp/         WebMCP tools: extractVitals, updateTriageBadge, cacheOfflineRecord
│   │   └── src/components/  ContextualTriagePanel (live, no manual prompting)
│   └── agent-orchestrator/  Node + Express + TypeScript cloud orchestrator
│       ├── src/config/      @google/genai (gemini-2.5-flash) client setup
│       ├── src/agents/      Triage Validator, Hospital Router, Supply Chain agents
│       └── src/mcp/         Tool declarations/handlers shared with Gemini function calling
```

### Edge layer (`apps/web-client`)

Runs entirely in the responder's browser, with or without connectivity:

- **On-device AI** (`src/ai/nano/builtInAI.ts`): wraps `window.ai.languageModel`
  and `window.ai.summarizer` for on-device inference, with readiness checks
  and a deterministic START-protocol heuristic fallback when the model is
  unavailable, still downloading, or unsupported.
- **WebMCP tools** (`src/mcp/webMcpTools.ts`): `extractVitals` (free-text →
  structured vitals), `updateTriageBadge` (DOM badge update), and
  `cacheOfflineRecord` (localStorage queue for later sync).
- **ContextualTriagePanel**: typing vitals or pasting field notes
  auto-suggests a triage priority in real time — no manual prompt
  copy-pasting required.

### Cloud layer (`apps/agent-orchestrator`)

An Express API that runs three cooperating Gemini-powered agents, each with
its own tool declarations resolved through a shared function-calling loop
(`src/agents/agentRuntime.ts`):

- **Triage Validator** — cross-checks a reported priority against raw vitals.
- **Hospital Router** — matches a patient's priority to the best-fit
  operational hospital with available capacity.
- **Supply Chain Agent** — matches pending medical resource requests to
  regional hospital stock and commits allocations.

`POST /api/orchestrate` runs all three agents for an incoming patient (plus
any accompanying resource requests) and returns a combined result.
`GET /api/health` is a liveness check.

## Getting started

```bash
pnpm install
cp apps/agent-orchestrator/.env.example apps/agent-orchestrator/.env
# edit apps/agent-orchestrator/.env and set GEMINI_API_KEY
pnpm build
pnpm dev
```

- `pnpm dev` — runs the Vite dev server (http://localhost:5173) and the
  Express orchestrator (http://localhost:8787) together, with `/api/*`
  requests proxied from the client dev server to the orchestrator.
- `pnpm build` — builds every workspace package in dependency order
  (`shared-types` first, then both apps).
- `pnpm lint` — runs ESLint across the whole workspace.

## Notes

- `window.ai` is an experimental, origin-trial-gated Chrome API. The wrapper
  in `builtInAI.ts` treats its absence as a normal runtime condition and
  always falls back to a deterministic START-protocol heuristic, so the
  triage panel works identically online, offline, or in browsers without
  built-in AI support.
- The orchestrator's hospital/supply data (`src/data/hospitals.ts`) is an
  in-memory seed dataset representing hospitals in Colombia's Eje Cafetero
  region; swap it for a real facility-status feed in production.
