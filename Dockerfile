# ==========================================
# Root Dockerfile for ProblemPulse Backend
# ==========================================

FROM node:20-alpine AS builder

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache openssl libc6-compat

# Copy backend dependency manifests
COPY backend/package*.json ./
COPY backend/prisma ./prisma/

# Install dependencies and generate Prisma client
RUN npm ci
RUN npx prisma generate

# Copy source code and build config
COPY backend/tsconfig.json ./
COPY backend/src ./src

# Compile TypeScript
RUN npm run build

# Prune dev dependencies
RUN npm prune --production

# ==========================================
# Production Runner Stage
# ==========================================
FROM node:20-alpine AS runner

WORKDIR /app

# Install runtime dependencies for Prisma
RUN apk add --no-cache openssl libc6-compat curl

ENV NODE_ENV=production
ENV PORT=10000

# Copy generated Prisma engine, client, schema, and compiled dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/dist ./dist

USER node

EXPOSE 10000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:10000/api/health || exit 1

CMD ["node", "dist/server.js"]
