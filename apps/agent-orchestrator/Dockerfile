# Builds the agent-orchestrator for deployment to Google Cloud Run (or any
# other Node-capable container host: Render, Fly.io, Vercel via a custom
# runtime, etc.). Only the workspace pieces this app actually needs
# (shared-types + agent-orchestrator) are copied in, so this also works
# correctly even though it lives inside a larger pnpm monorepo.
FROM node:22-slim AS base
RUN corepack enable

WORKDIR /app

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json tsconfig.base.json ./
COPY packages/shared-types packages/shared-types
COPY apps/agent-orchestrator apps/agent-orchestrator

RUN pnpm install --frozen-lockfile
RUN pnpm --filter @agentic-web-starter/shared-types build
RUN pnpm --filter @agentic-web-starter/agent-orchestrator build

ENV NODE_ENV=production
# Cloud Run always injects PORT and expects the container to listen on it;
# 8080 is its convention and a sane default for `docker run` too.
ENV PORT=8080
EXPOSE 8080

CMD ["node", "apps/agent-orchestrator/dist/index.js"]
