FROM node:18-bullseye-slim AS builder
WORKDIR /app

# Use corepack/pnpm for workspace installs
RUN corepack enable && corepack prepare pnpm@10.26.2 --activate

# Copy workspace root files first
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml tsconfig.base.json ./
# Copy backend workspace
COPY backend ./backend

# Install all dependencies with frozen lockfile for deterministic builds
WORKDIR /app/backend
RUN cd /app && pnpm install --frozen-lockfile

# Generate Prisma client before build
RUN pnpm prisma generate --schema=prisma/schema.prisma
# Verify generated client exists in common pnpm layouts (either direct or inside .pnpm store)
RUN if [ -d node_modules/@prisma/client ] || (ls node_modules/.pnpm 2>/dev/null | grep -q '@prisma+client'); then echo "Prisma client generated"; else echo "Prisma client generation failed: generated client not found" && exit 1; fi
RUN pnpm run build

FROM node:18-bullseye-slim AS runner
WORKDIR /app/backend
ENV NODE_ENV=production

# Copy shared node_modules and backend-specific files from builder
COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app/backend/node_modules ./node_modules
COPY --from=builder /app/backend/dist ./dist
COPY --from=builder /app/backend/prisma ./prisma
COPY --from=builder /app/backend/package*.json ./

EXPOSE 3000
# Run migrations then start server with explicit logging
CMD ["sh", "-c", "echo 'Starting container...' && echo 'Running Prisma migrations...' && npx prisma migrate deploy 2>&1 && echo 'Migrations completed. Starting server...' && node dist/server.js"]
