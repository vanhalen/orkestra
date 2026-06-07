# ---------- build da SPA ----------
FROM node:22-alpine AS web
WORKDIR /app/web
COPY web/package.json web/package-lock.json ./
RUN npm ci
COPY web/ ./
RUN npm run build

# ---------- runtime: API + SPA (porta única) ----------
FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production HOST=0.0.0.0 PORT=3000

# patch de CVEs dos pacotes do SO (base image)
RUN apk -U upgrade --no-cache

# tsx é runtime (dependency); --omit=dev deixa a imagem enxuta
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY tsconfig.json ./
COPY src ./src
# SPA buildada — servida pela própria API (plugins/staticWeb.ts)
COPY --from=web /app/web/dist ./web/dist

EXPOSE 3000
USER node
# roda em processo único (bom p/ sinais/SIGTERM do container)
CMD ["node", "--import", "tsx", "src/index.ts"]
