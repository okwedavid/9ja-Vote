# syntax=docker/dockerfile:1
# 9ja Vote public-web. Build from the repository root:
#   docker build -f apps/public-web/Dockerfile -t 9ja-vote-public-web .
FROM node:22-alpine AS build
WORKDIR /repo
COPY package.json package-lock.json ./
COPY packages/shared-types/package.json packages/shared-types/
COPY packages/design-system/package.json packages/design-system/
COPY apps/api/package.json apps/api/
COPY apps/public-web/package.json apps/public-web/
COPY apps/admin/package.json apps/admin/
COPY apps/broadcast/package.json apps/broadcast/
RUN npm ci --no-audit --no-fund
COPY packages ./packages
COPY apps/public-web ./apps/public-web
RUN npm run build:packages && npm run build -w @9ja-vote/public-web

FROM node:22-alpine AS runtime
ENV NODE_ENV=production     NEXT_TELEMETRY_DISABLED=1     PORT=3000
WORKDIR /repo
COPY --from=build --chown=node:node /repo/node_modules ./node_modules
COPY --from=build --chown=node:node /repo/packages/shared-types ./packages/shared-types
COPY --from=build --chown=node:node /repo/packages/design-system ./packages/design-system
COPY --from=build --chown=node:node /repo/apps/public-web/package.json ./apps/public-web/package.json
COPY --from=build --chown=node:node /repo/apps/public-web/next.config.mjs ./apps/public-web/next.config.mjs
COPY --from=build --chown=node:node /repo/apps/public-web/.next ./apps/public-web/.next
COPY --from=build --chown=node:node /repo/apps/public-web/public ./apps/public-web/public
WORKDIR /repo/apps/public-web
USER node
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3000/ || exit 1
CMD ["npx", "next", "start", "-H", "0.0.0.0", "-p", "3000"]
