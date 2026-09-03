# Builds the agent-orchestrator for deployment to Google Cloud Run (or any
# other Node-capable container host: Render, Fly.io, etc.). Lives at the
# repo root — not inside apps/agent-orchestrator — because Cloud Run's
# `--source` build uses the Dockerfile's own directory as the entire build
# context, and this Dockerfile needs to see the monorepo root (lockfile,
# workspace config, packages/shared-types) to build correctly. Only the
# workspace pieces this app actually needs are copied in.
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
