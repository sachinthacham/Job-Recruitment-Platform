# ─── Stage 1: Development ──────────────────────────────────
FROM node:20-alpine AS development

WORKDIR /app

COPY apps/api/package*.json ./apps/api/
RUN cd apps/api && npm ci

COPY apps/api/ ./apps/api/
COPY libs/ ./libs/

WORKDIR /app/apps/api

RUN npx prisma generate

CMD ["npm", "run", "start:dev"]

# ─── Stage 2: Build ───────────────────────────────────────
FROM node:20-alpine AS build

WORKDIR /app

COPY apps/api/package*.json ./apps/api/
RUN cd apps/api && npm ci

COPY apps/api/ ./apps/api/
COPY libs/ ./libs/

WORKDIR /app/apps/api

RUN npx prisma generate
RUN npm run build

# ─── Stage 3: Production ──────────────────────────────────
FROM node:20-alpine AS production

WORKDIR /app

COPY --from=build /app/apps/api/package*.json ./
RUN npm ci --only=production

COPY --from=build /app/apps/api/dist ./dist
COPY --from=build /app/apps/api/prisma ./prisma
COPY --from=build /app/apps/api/node_modules/.prisma ./node_modules/.prisma

RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001 && \
    mkdir -p /app/uploads && \
    chown -R nestjs:nodejs /app

USER nestjs

EXPOSE 3000

CMD ["node", "dist/main.js"]
