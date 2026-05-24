# ── Stage 1: Install Dependencies ─────────────────────────
FROM node:18-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm install --legacy-peer-deps --only=production

# ── Stage 2: Production Image ──────────────────────────────
FROM node:18-alpine
WORKDIR /app

# Security: create non-root user
# Never run Node.js as root in production
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy only production node_modules from Stage 1
COPY --from=deps /app/node_modules ./node_modules

# Copy source code (not tests, not .env files)
COPY src/ ./src/
COPY package.json ./

# Set correct ownership
RUN chown -R appuser:appgroup /app
USER appuser

EXPOSE 3001

# Docker health check — marks container unhealthy if /health fails
# Kubernetes uses this in Phase 07
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget -qO- http://localhost:3001/health || exit 1

CMD ["node", "src/server.js"]