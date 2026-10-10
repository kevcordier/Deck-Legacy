# API image for Google Cloud Run (EDR-035). Build context: repository root.
FROM node:24.21.0-slim AS build
ENV HUSKY=0
RUN corepack enable
WORKDIR /app
COPY . .
RUN pnpm install --frozen-lockfile --filter "@deck-legacy/server..." && pnpm build:server

# shortcut: ships the build stage's dev dependencies too (simpler than pruning a hoisted workspace); prune if the image gets too big.
FROM node:24.21.0-slim
ENV NODE_ENV=production
WORKDIR /app
COPY --from=build /app /app
USER node
WORKDIR /app/apps/server
CMD ["node", "dist/main.js"]
