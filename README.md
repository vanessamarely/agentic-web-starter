# Agentic Web Starter — Building Agentic Apps with Gemini Flash and Nano

A pnpm-workspaces monorepo built for the talk **"Building Agentic Apps with
Gemini Flash and Nano"** (GoFest Bogotá). It combines an **offline-first edge
triage client**, a **cloud multi-agent orchestrator**, and a **Codelab-style
presentation app**, using a disaster-response scenario (inspired by
earthquake relief in Colombia) as the running example for three live demos:

1. **Interactive Web Apps with Gemini Nano & WebMCP** — on-device inference in the browser.
2. **Orchestrating Multi-Agent Workflows with Gemini Flash** — cloud function calling across specialist agents.
3. **Local Agents with Gemma, Gemini Nano & WebMCP** — an open-weights model running fully in-browser via Google AI Edge / MediaPipe.

## Architecture

```
agentic-web-starter/
├── packages/
│   └── shared-types/        Zod schemas + TS types shared by every app
├── apps/
│   ├── web-client/          React + Vite + Tailwind — hosts all 3 demos as tabs
│   │   ├── src/ai/nano/     Chrome Built-in AI (window.ai) wrapper + offline heuristic + demo mode
│   │   ├── src/ai/gemma/    MediaPipe LLM Inference wrapper for running Gemma in-browser
│   │   ├── src/mcp/         WebMCP tools: extractVitals, updateTriageBadge, cacheOfflineRecord + call log
│   │   └── src/components/  ContextualTriagePanel · OrchestrationConsole · LocalGemmaAgentPanel
│   ├── agent-orchestrator/  Node + Express + TypeScript cloud orchestrator
│   │   ├── src/config/      @google/genai (gemini-2.5-flash) client setup
│   │   ├── src/agents/      Triage Validator, Hospital Router, Supply Chain agents
│   │   └── src/mcp/         Tool declarations/handlers shared with Gemini function calling
│   └── codelab/             Google-Codelabs-styled walkthrough of the whole talk + all 3 demos
```

### Demo 1 · Gemini Nano + WebMCP (`apps/web-client`, tab "1")

- **On-device AI** (`src/ai/nano/builtInAI.ts`): wraps `window.ai.languageModel`
  for on-device inference, with readiness checks, a deterministic
  START-protocol heuristic fallback, and a **demo mode** toggle that
  simulates a ready model so the talk never depends on the venue's Chrome
  flags.
- **WebMCP tools** (`src/mcp/webMcpTools.ts`): `extractVitals`,
  `updateTriageBadge`, `cacheOfflineRecord` — every invocation is logged to a
  live **Tool Call Console** so the audience can see the pattern firing.
- **ContextualTriagePanel**: typing field notes auto-suggests a triage
  priority in real time, no manual prompt copy-pasting required.

### Demo 2 · Gemini Flash multi-agent (`apps/web-client` tab "2" + `apps/agent-orchestrator`)

`POST /api/orchestrate` runs three cooperating Gemini-powered agents in
parallel, each with its own tool declarations resolved through a shared
function-calling loop (`src/agents/agentRuntime.ts`):

- **Triage Validator** — cross-checks a reported priority against raw vitals.
- **Hospital Router** — matches a patient's priority to the best-fit
  operational hospital with available capacity.
- **Supply Chain Agent** — matches pending medical resource requests to
  regional hospital stock and commits allocations.

The **OrchestrationConsole** UI visualizes each agent's tool-call trace as it
completes. `GET /api/health` is a liveness check.

### Demo 3 · Gemma local + WebMCP (`apps/web-client` tab "3")

`src/ai/gemma/mediapipeGemma.ts` is a real integration with
[`@mediapipe/tasks-genai`](https://ai.google.dev/edge/mediapipe/solutions/genai/llm_inference/web_js)
to run an open Gemma model fully in-browser (WASM/WebGPU). The
**LocalGemmaAgentPanel** demonstrates the key design pattern for small
on-device models: deterministic WebMCP tools handle the critical
classification (extract vitals, compute priority), and the local LLM is only
asked to generate the natural-language handoff report. A **safe mode**
toggle (on by default) runs a templated fallback so the live demo never
depends on a model download at the venue — see [Setting up the Gemma
demo](#setting-up-the-gemma-demo-optional) below.

### Codelab (`apps/codelab`)

A Google-Codelabs-styled, step-by-step walkthrough of the entire talk in
Spanish: the Google AI ecosystem (Gemini API, Nano, Gemma, Vertex AI Model
Garden, AI Studio, Genkit, ADK, Google AI Edge), then one module per demo
with the concept, the real code, and a button that opens the live demo in a
new tab. Runs as its own app so it can be projected while `web-client` and
`agent-orchestrator` run the actual demos.

## Getting started

```bash
pnpm install
cp apps/agent-orchestrator/.env.example apps/agent-orchestrator/.env
# edit apps/agent-orchestrator/.env and set GEMINI_API_KEY
pnpm build
pnpm dev
```

- `pnpm dev` — runs all three apps together: the web client
  (http://localhost:5173), the Express orchestrator (http://localhost:8787,
  proxied from `/api/*`), and the codelab (http://localhost:5175).
- `pnpm build` — builds every workspace package in dependency order
  (`shared-types` first, then the three apps).
- `pnpm lint` — runs ESLint across the whole workspace.

## Setting up the Gemma demo (optional)

Demo 3 works out of the box in **safe mode** (no download needed). To show
real on-device inference:

1. Go to [Kaggle Models](https://www.kaggle.com/models/google/gemma) or
   Google AI Edge and accept the Gemma license.
2. Download a web-compatible variant (`.task` or `.litertlm`, e.g. a Gemma 3
   1B int4 build).
3. Save it as `apps/web-client/public/models/gemma.task` (gitignored — never
   commit model weights).
4. In the app's "Agente Local con Gemma" tab, uncheck "Modo seguro" and press
   "Cargar Gemma real".

Do this **before** the talk — the model is several hundred MB and requires
manual license acceptance that can't be automated.

## Notes

- `window.ai` is an experimental, origin-trial-gated Chrome API. The wrapper
  in `builtInAI.ts` treats its absence as a normal runtime condition and
  falls back to a deterministic START-protocol heuristic (or the demo-mode
  simulation), so the triage panel always works regardless of the browser.
- The orchestrator's hospital/supply data (`src/data/hospitals.ts`) is an
  in-memory seed dataset representing hospitals in Colombia's Eje Cafetero
  region; swap it for a real facility-status feed in production.
