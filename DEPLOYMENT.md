# Deployment

Short answer to "does this need to run on Google Cloud?": **no**. Only the
two static apps (`web-client`, `codelab`) and the one Node backend
(`agent-orchestrator`) need hosting, and none of them require Google
infrastructure specifically — Gemini is just an HTTPS API called from
wherever your backend runs.

| App | What it is | Where it can go |
|---|---|---|
| `apps/web-client` | Static Vite build | Vercel, GitHub Pages, Firebase Hosting, Netlify — anywhere that serves static files |
| `apps/codelab` | Static Vite build | Same as above |
| `apps/agent-orchestrator` | Node/Express server, needs `GEMINI_API_KEY` as a secret | Any Node-capable host: **Google Cloud Run** (recommended, see below), Render, Fly.io, Railway |

The recommendation below (Vercel + Cloud Run) is the path with the least
friction for this specific repo, not a requirement — pick whichever hosts you
already know. None of these commands have been run for you; they need your
own accounts and credentials, so run them yourself when you're ready.

## Static apps → Vercel (recommended for this monorepo)

Vercel auto-detects Vite and lets you set a **Root Directory** per project,
which matters here since this is a monorepo with two separate Vite apps:

1. Push this repo to GitHub (already done).
2. On [vercel.com](https://vercel.com), "Add New Project" → import the repo
   → set **Root Directory** to `apps/web-client` → deploy. Repeat with a
   second project for `apps/codelab`.
3. In `apps/web-client`'s Vercel project, add an environment variable
   pointing the client at your deployed backend if you're not using the dev
   proxy — see [Wiring the client to the backend](#wiring-the-client-to-the-backend) below.

Vercel also works with the Vercel CLI if you'd rather not use the dashboard:

```bash
npm install -g vercel
cd apps/web-client && vercel --prod
cd ../codelab && vercel --prod
```

### Alternative: GitHub Pages

Works too, but GitHub Pages serves one site per repo with no built-in
per-app root directory concept, so each app needs its own `base` path in
`vite.config.ts` (e.g. `base: "/web-client/"`) matching where you publish it,
and a GitHub Actions workflow that builds both apps and pushes `dist/` to
the `gh-pages` branch under matching subfolders. More setup than Vercel for
a two-app monorepo like this one; only worth it if you specifically want to
stay on GitHub's infrastructure.

## Backend → Google Cloud Run (recommended)

A `Dockerfile` is already included at `apps/agent-orchestrator/Dockerfile`.
Cloud Run is a natural fit for a Google-AI-themed talk (it's serverless, it
scales to zero between demo runs, and secrets integrate cleanly with
`GEMINI_API_KEY`), but it is not required — the same Dockerfile runs on
Render, Fly.io, or any other container host.

```bash
# One-time setup
gcloud auth login
gcloud config set project YOUR_PROJECT_ID

# Store the API key as a secret instead of an env var in plain text
echo -n "YOUR_GEMINI_API_KEY" | gcloud secrets create gemini-api-key --data-file=-

# Build and deploy straight from source (Cloud Run builds the Dockerfile for you)
gcloud run deploy agent-orchestrator \
  --source apps/agent-orchestrator \
  --region us-central1 \
  --allow-unauthenticated \
  --set-secrets GEMINI_API_KEY=gemini-api-key:latest
```

`gcloud run deploy` prints the live HTTPS URL when it finishes — that's your
`agent-orchestrator` base URL for the next step.

### Alternative: Vercel (single-platform option)

If you'd rather keep everything on one platform, Vercel can also run the
Express app as serverless functions, but Express needs a thin adapter
(`api/index.ts` re-exporting the Express `app`) and a `vercel.json`
rewriting all `/api/*` requests to it — more restructuring than Cloud Run's
"deploy the Dockerfile as-is."

## Wiring the client to the backend

Locally, `apps/web-client/vite.config.ts` proxies `/api/*` to
`http://localhost:8787` — that proxy only exists in the Vite **dev server**
and does not exist in a static production build. Once deployed, either:

- Put both apps behind the same domain/reverse proxy so `/api/*` still
  resolves to the backend, or
- Change the `fetch("/api/...")` calls in `OrchestrationConsole.tsx` and
  `VoiceNoteButton.tsx` to a full URL, e.g. read it from
  `import.meta.env.VITE_ORCHESTRATOR_URL` (set that env var in your Vercel
  project settings to the Cloud Run URL from the previous step) and enable
  CORS for your deployed frontend's origin in
  `apps/agent-orchestrator/src/index.ts` (currently `cors()` allows any
  origin, which is fine for a demo but worth tightening for anything
  longer-lived).
