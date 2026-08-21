# ─── Stage 1: Development ──────────────────────────────────
FROM node:20-alpine AS development

WORKDIR /app

COPY apps/web/package*.json ./apps/web/
RUN cd apps/web && npm ci

COPY apps/web/ ./apps/web/

WORKDIR /app/apps/web

CMD ["npm", "run", "start", "--", "--host", "0.0.0.0"]

# ─── Stage 2: Build ───────────────────────────────────────
FROM node:20-alpine AS build

WORKDIR /app

COPY apps/web/package*.json ./apps/web/
RUN cd apps/web && npm ci

COPY apps/web/ ./apps/web/

WORKDIR /app/apps/web

RUN npm run build -- --configuration=production

# ─── Stage 3: Production (nginx) ──────────────────────────
FROM nginx:alpine AS production

COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/apps/web/dist/web/browser /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
