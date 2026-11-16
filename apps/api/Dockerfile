# syntax=docker/dockerfile:1
# 9ja Vote API. Build from the repository root:
#   docker build -f apps/api/Dockerfile -t 9ja-vote-api .
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
COPY apps/api ./apps/api
RUN npm run build:packages && npm run build -w @9ja-vote/api

FROM node:22-alpine AS runtime
ENV NODE_ENV=production \
    DATA_STORE_PATH=/data/store.json \
    API_PORT=4000 \
    NODE_OPTIONS=--enable-source-maps
WORKDIR /repo
RUN mkdir -p /data && chown -R node:node /data
COPY --from=build --chown=node:node /repo/node_modules ./node_modules
COPY --from=build --chown=node:node /repo/packages/shared-types ./packages/shared-types
COPY --from=build --chown=node:node /repo/apps/api/package.json ./apps/api/package.json
COPY --from=build --chown=node:node /repo/apps/api/dist ./apps/api/dist
WORKDIR /repo/apps/api
USER node
EXPOSE 4000
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget -qO- http://127.0.0.1:4000/api/v1/health || exit 1
CMD ["node", "dist/main.js"]
