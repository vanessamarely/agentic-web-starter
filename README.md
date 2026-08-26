# Agentic Web Starter — Building Agentic Apps with Gemini Flash and Nano

A pnpm-workspaces monorepo built for the talk **"Building Agentic Apps with
Gemini Flash and Nano"** (GoFest Bogotá). It combines an **offline-first edge
triage client**, a **cloud multi-agent orchestrator**, and a **Codelab-style
presentation app**, using a disaster-response scenario (inspired by
earthquake relief in Colombia) as the running example for three live demos:

1. **Interactive Web Apps with Gemini Nano & WebMCP** — on-device inference in the browser.
2. **Orchestrating Multi-Agent Workflows with Gemini Flash** — cloud function calling across specialist agents.
3. **Local Agents with Gemma, Gemini Nano & WebMCP** — an open-weights model running fully in-browser via Google AI Edge / MediaPipe.
4. **(Bonus) Google AI Studio vs. Gemini Enterprise Agent Platform** — the same `gemini-3.7-flash` model called two ways: an AI Studio API key versus the Agent Platform (formerly Vertex AI) authenticating as Cloud Run's own service identity, no key at all.
5. **(Extra) Travel planner multi-agent** — three ADK research agents (flights, hotels, activities) run in parallel, then a fourth synthesizes them into an itinerary. Same domain-agnostic ADK pattern as Demo 2, applied to a different problem.
6. **(Extra) Medical context panel with WebMCP** — the same "register tools on `document.modelContext`" pattern from Demo 1, applied to a lab-results panel instead of a form, plus Chrome's Summarizer API for on-device explanations.

Demos 1, 2 and 5 each have a **Google AI Studio / Agent Platform** toggle next to their run button — same code, same `gemini-3.7-flash` model, different credentials. Useful when a venue only hands out Google Cloud credits instead of AI Studio credits.

## Architecture

```
agentic-web-starter/
├── packages/
│   └── shared-types/        Zod schemas + TS types shared by every app
├── apps/
│   ├── web-client/          React + Vite + Tailwind — hosts all 6 demos as tabs
│   │   ├── src/ai/nano/     Chrome Built-in AI (global LanguageModel) wrapper + offline heuristic + demo mode
│   │   ├── src/ai/gemma/    MediaPipe LLM Inference wrapper for running Gemma in-browser
│   │   ├── src/mcp/         WebMCP tools (document.modelContext): triage tools + medical panel tools + call log
│   │   └── src/components/  ContextualTriagePanel · OrchestrationConsole · LocalGemmaAgentPanel · TravelPlannerPanel · MedicalContextPanel · AiModeToggle
│   ├── agent-orchestrator/  Node + Express + TypeScript cloud orchestrator
│   │   ├── src/config/      @google/genai (gemini-3.7-flash) client setup — AI Studio and Agent Platform
│   │   ├── src/agents/      Triage Validator, Hospital Router, Supply Chain, Travel Planner agents (dual-mode ADK)
│   │   └── src/mcp/         Tool declarations/handlers shared with Gemini function calling
│   └── codelab/             Google-Codelabs-styled walkthrough of the whole talk + all 6 demos
```

### Demo 1 · Gemini Nano + WebMCP (`apps/web-client`, tab "1")

- **On-device AI** (`src/ai/nano/builtInAI.ts`): wraps the global
  `LanguageModel` (Chrome's Prompt API, on by default since Chrome 148) for
  on-device inference, with readiness checks, a deterministic
  START-protocol heuristic fallback, and a **demo mode** toggle that
  simulates a ready model so the talk never depends on the venue's Chrome
  version.
- **WebMCP tools** (`src/mcp/webMcpTools.ts`): `extractVitals`,
  `updateTriageBadge`, `cacheOfflineRecord` — registered with the real
  `document.modelContext` API (WebMCP, Origin Trial since Chrome 149 / Edge
  150, or `chrome://flags/#enable-webmcp-testing` locally) when the browser
  supports it, and always callable directly by the demo's own code either
  way. Every invocation is logged to a live **Tool Call Console**.
- **ContextualTriagePanel**: typing field notes auto-suggests a triage
  priority in real time, no manual prompt copy-pasting required.
- **Voice dictation** (`VoiceNoteButton.tsx` + `POST /api/transcribe`): a real
  optional feature, not just UI copy — records a voice note in the browser
  and sends it to `agent-orchestrator`, which transcribes it using
  `gemini-3.7-flash`'s native audio understanding (no separate speech-to-text
  model). The transcript flows into the same `extractVitals` pipeline as
  typed notes.

### Demo 2 · Gemini Flash multi-agent (`apps/web-client` tab "2" + `apps/agent-orchestrator`)

`POST /api/orchestrate` runs three cooperating agents in parallel, each a
real `LlmAgent` built with Google's **Agent Development Kit**
(`@google/adk`, TypeScript SDK) — not a hand-rolled function-calling loop.
`src/agents/adkRuntime.ts` adapts this project's shared tool definitions
into ADK `FunctionTool`s and drives each agent through an ADK
`InMemoryRunner`, collecting a tool-call trace from its event stream:

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

### Demo 4 (bonus) · AI Studio vs. Agent Platform (`apps/web-client` tab "4")

`GET /api/briefing` calls the same `gemini-3.7-flash` model as the rest of
the backend, but through a second `@google/genai` client
(`src/config/agentPlatformGenai.ts`) configured with `vertexai: true` for
the **Gemini Enterprise Agent Platform** (Google Cloud's current name for
what used to be Vertex AI) instead of an AI Studio API key — authenticating
via Application Default Credentials, which on Cloud Run is the service's own
identity. It reads every hospital's current status and asks the model for an
executive briefing, a genuinely different task from the per-patient demos.

### Demo 5 (extra) · Travel planner multi-agent (`apps/web-client` tab "5")

`POST /api/travel-plan` (`src/agents/travelPlanner.ts`) runs the same
domain-agnostic ADK pattern as Demo 2 — parallel specialist agents feeding a
synthesis step — applied to a different problem: three ADK `LlmAgent`s
(flights, hotels, activities) research a trip concurrently via `Promise.all`,
then a fourth agent combines their output into a day-by-day itinerary. None
of the four need tools, just generation. Inspired by a separate
[`travel-planner-multi`](https://github.com/vanessamarely/travel-planner-multi)
project, rebuilt here on this repo's real ADK infrastructure
(`createDualModeAdkAgent`, `runAdkAgentTurn`) on `gemini-3.7-flash`, with the
same AI Studio / Agent Platform toggle as Demos 1 and 2.

### Demo 6 (extra) · Medical context panel with WebMCP (`apps/web-client` tab "6")

Applies the same "register tools on `document.modelContext`" WebMCP pattern
from Demo 1 to a different UI: a lab-results panel where clicking any result
generates a plain-language explanation on-device, via Chrome's
[Summarizer API](https://developer.chrome.com/docs/ai/summarizer-api)
(falling back to the same `LanguageModel` used elsewhere), plus a follow-up
Q&A tab. Three real WebMCP tools (`listLabResults`, `getLabResult`,
`explainLabResult`, in `src/mcp/medicalMcpTools.ts`) make this panel's data
and on-device AI callable by any browser agent that discovers them. Inspired
by a separate
[`contextual-ai-panel`](https://github.com/vanessamarely/contextual-ai-panel)
project, rebuilt here with this monorepo's own data, styling, and WebMCP
tools.

### Codelab (`apps/codelab`)

A Google-Codelabs-styled, step-by-step walkthrough of the entire talk in
Spanish: the Google AI ecosystem (Gemini API, Nano, Gemma, Model Garden on
the Gemini Enterprise Agent Platform, AI Studio, Genkit, ADK, Google AI
Edge), then one module per demo
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

## Deploying

See [DEPLOYMENT.md](DEPLOYMENT.md) — the recommended path is Firebase
Hosting (static apps) + Cloud Run (backend), an all-Google stack that stays
effectively free at demo-audience traffic (`firebase.json` and a
Cloud-Run-ready `Dockerfile` are already included). Non-Google hosting
(Vercel, GitHub Pages) is also documented as an alternative if you don't
need the "runs on Google" story.

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

- `LanguageModel` (Prompt API) and `document.modelContext` (WebMCP) are both
  feature-detected — the code treats their absence as a normal runtime
  condition and falls back to a deterministic START-protocol heuristic (or
  the demo-mode simulation), so the triage panel always works regardless of
  the browser or flags.
- The orchestrator's hospital/supply data (`src/data/hospitals.ts`) is an
  in-memory seed dataset representing hospitals in Colombia's Eje Cafetero
  region; swap it for a real facility-status feed in production.
