# syntax=docker/dockerfile:1
# 9ja Vote admin. Build from the repository root:
#   docker build -f apps/admin/Dockerfile -t 9ja-vote-admin .
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
COPY apps/admin ./apps/admin
RUN npm run build:packages && npm run build -w @9ja-vote/admin

FROM node:22-alpine AS runtime
ENV NODE_ENV=production     NEXT_TELEMETRY_DISABLED=1     PORT=3001
WORKDIR /repo
COPY --from=build --chown=node:node /repo/node_modules ./node_modules
COPY --from=build --chown=node:node /repo/packages/shared-types ./packages/shared-types
COPY --from=build --chown=node:node /repo/packages/design-system ./packages/design-system
COPY --from=build --chown=node:node /repo/apps/admin/package.json ./apps/admin/package.json
COPY --from=build --chown=node:node /repo/apps/admin/next.config.mjs ./apps/admin/next.config.mjs
COPY --from=build --chown=node:node /repo/apps/admin/.next ./apps/admin/.next
COPY --from=build --chown=node:node /repo/apps/admin/public ./apps/admin/public
WORKDIR /repo/apps/admin
USER node
EXPOSE 3001
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3001/ || exit 1
CMD ["npx", "next", "start", "-H", "0.0.0.0", "-p", "3001"]
