# Deployment

Recommended stack for this talk: **Firebase Hosting** (static apps) +
**Cloud Run** (backend) — both are Google products, both are effectively
free at demo-audience traffic levels, and neither has an "idle cost": Hosting
is CDN-served static files (not compute), and Cloud Run scales to zero
between requests. None of this has been run for you — it needs your own
Firebase/Google Cloud login, so run these commands yourself.

## 1. One-time setup

```bash
npm install -g firebase-tools
firebase login
firebase use --add   # pick or create a Firebase project; creates .firebaserc
```

Creating a Firebase project does **not** require a paid plan and does not
ask for a credit card — Hosting alone runs on the free Spark plan. You'll
only need to upgrade to the pay-as-you-go Blaze plan (still has a real free
tier) when you deploy the Cloud Run backend in step 3 — that's a Google
Cloud billing requirement for Cloud Run itself, not for Hosting.

## 2. Deploy the two static apps to Firebase Hosting

Build both, then create the two Hosting sites (one-time) and deploy:

```bash
pnpm --filter @agentic-web-starter/web-client build
pnpm --filter @agentic-web-starter/codelab build

firebase hosting:sites:create your-project-id-web-client
firebase hosting:sites:create your-project-id-codelab
firebase target:apply hosting webclient your-project-id-web-client
firebase target:apply hosting codelab your-project-id-codelab

firebase deploy --only hosting
```

`firebase.json` at the repo root already defines both sites (targets
`webclient` and `codelab`, pointing at each app's `dist/`) — you only need to
swap the site IDs above for whatever you named them. Each gets its own free
`*.web.app` URL, or attach a custom domain from the Firebase console (also
free, includes SSL).

## 3. Deploy the backend to Cloud Run

A `Dockerfile` is already included at the **repo root** (not inside
`apps/agent-orchestrator`) — Cloud Run's `--source` build uses the
Dockerfile's own directory as the entire build context, and this build needs
to see the monorepo root (`pnpm-lock.yaml`, `packages/shared-types`, etc.),
so `--source .` from the repo root is required.

```bash
gcloud auth login
gcloud config set project YOUR_PROJECT_ID   # same project as Firebase, ideally

# Store the API key as a secret instead of an env var in plain text
echo -n "YOUR_GEMINI_API_KEY" | gcloud secrets create gemini-api-key --data-file=-

gcloud run deploy agent-orchestrator \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --set-secrets GEMINI_API_KEY=gemini-api-key:latest \
  --min-instances=0 \
  --max-instances=2
```

`firebase.json`'s `webclient` site already rewrites `/api/**` to this exact
Cloud Run service (`serviceId: agent-orchestrator`, `region: us-central1`) —
so once both are deployed, `https://your-web-client-site.web.app/api/health`
transparently reaches the backend, no CORS setup, no separate domain, no
changes to the frontend code. Re-run `firebase deploy --only hosting:webclient`
after the Cloud Run service exists so Hosting picks up the rewrite target.

## Keeping cost at effectively zero

- **Cloud Run only bills while handling a request** — no traffic between
  demo sessions means no cost between them. The free tier (per month: ~2M
  requests, 360k GB-seconds memory, 180k vCPU-seconds) comfortably covers a
  conference audience trying the demo.
- **Firebase Hosting's free Spark tier** covers 10 GB stored and 360 MB/day
  served — this app is a few MB, so that's roughly 100+ full loads/day,
  forever, at $0.
- Set a **budget alert** in Google Cloud Billing (e.g. notify at $1) so
  you're warned before any real spend accumulates, not after.
- If you want to guarantee $0 after the event: `gcloud run services delete
  agent-orchestrator`. Firebase Hosting can stay published indefinitely at
  no cost since it's static.

## Alternative: Vercel / GitHub Pages (if you don't need the "runs on Google" story)

Vercel auto-detects Vite and lets you set a per-app **Root Directory**
(`apps/web-client`, `apps/codelab`), which is simpler for a multi-app
monorepo than GitHub Pages' single-site-per-repo model. Express needs a thin
serverless adapter to run on Vercel, whereas the included Dockerfile deploys
to Cloud Run as-is — that asymmetry, plus wanting the demo to visibly run on
Google infrastructure for this talk, is why Firebase + Cloud Run is the
primary recommendation above rather than Vercel end-to-end.
