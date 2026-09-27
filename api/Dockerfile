# ==========================================
# Stage 1: build (instala deps + compila Nest)
# ==========================================
FROM node:20-bookworm-slim AS builder

WORKDIR /app

# Ferramentas para compilar módulos nativos (bcrypt) caso não haja binário pré-compilado
RUN apt-get update \
  && apt-get install -y --no-install-recommends python3 make g++ \
  && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build \
  && npm prune --omit=dev

# ==========================================
# Stage 2: runtime
# ==========================================
FROM node:20-bookworm-slim AS runner

RUN apt-get update \
  && apt-get install -y --no-install-recommends \
    ca-certificates \
    tzdata \
  && rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production \
    PORT=3011 \
    TZ=America/Sao_Paulo

WORKDIR /app

COPY --from=builder --chown=node:node /app/package.json ./package.json
COPY --from=builder --chown=node:node /app/node_modules ./node_modules
COPY --from=builder --chown=node:node /app/dist ./dist

# Pasta de uploads locais — montada como volume no compose
RUN mkdir -p /app/uploads/profile-images \
  && chown -R node:node /app/uploads

USER node

EXPOSE 3011

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:' + (process.env.PORT || 3011) + '/api').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"

CMD ["node", "dist/main.js"]
