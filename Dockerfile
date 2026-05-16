# ── Stage 1: install dependencies ────────────────────────────────────────────
FROM node:22-alpine AS deps

# openssl + libc6-compat are needed by Prisma query engine on Alpine
RUN apk add --no-cache openssl libc6-compat

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# ── Stage 2: build ────────────────────────────────────────────────────────────
FROM node:22-alpine AS builder

RUN apk add --no-cache openssl libc6-compat

WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma client (linux-musl target picked up automatically)
ENV DATABASE_URL="file:/app/data/villa.db"
ENV NEXT_TELEMETRY_DISABLED=1
RUN npx prisma generate
RUN npm run build

# ── Stage 3: production runner ────────────────────────────────────────────────
FROM node:22-alpine AS runner

RUN apk add --no-cache openssl libc6-compat

WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Non-root user for security
RUN addgroup -S nodejs && adduser -S nextjs -G nodejs

# App files
COPY --from=builder /app/node_modules      ./node_modules
COPY --from=builder /app/.next             ./.next
COPY --from=builder /app/public            ./public
COPY --from=builder /app/package.json      ./package.json
COPY --from=builder /app/src/generated     ./src/generated

# Prisma schema + migrations (needed at runtime for migrate deploy)
COPY --from=builder /app/prisma            ./prisma
COPY --from=builder /app/prisma.config.ts  ./prisma.config.ts

# Startup script
COPY entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh

# Persistent data directory (SQLite lives here via volume mount)
RUN mkdir -p /app/data /app/public/uploads \
 && chown -R nextjs:nodejs /app

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

ENTRYPOINT ["./entrypoint.sh"]
