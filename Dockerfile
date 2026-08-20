FROM node:22.13.0-bookworm-slim AS builder

WORKDIR /app

RUN npm install --global pnpm@10.4.1
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm build
RUN pnpm build:server
RUN pnpm prune --prod

FROM node:22.13.0-bookworm-slim AS runtime

WORKDIR /app
ENV NODE_ENV=production \
    PORT=3000 \
    DATABASE_PATH=/data/propertyops.sqlite \
    SESSION_TTL_SECONDS=28800 \
    COOKIE_SECURE=false

COPY --from=builder --chown=node:node /app/package.json ./package.json
COPY --from=builder --chown=node:node /app/node_modules ./node_modules
COPY --from=builder --chown=node:node /app/dist ./dist
COPY --from=builder --chown=node:node /app/dist-server ./dist-server

RUN mkdir -p /data && chown node:node /data

USER node
EXPOSE 3000
CMD ["node", "dist-server/server/main.js"]

