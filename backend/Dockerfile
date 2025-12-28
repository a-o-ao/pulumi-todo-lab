FROM node:18-bullseye-slim AS builder
WORKDIR /app

# Use corepack/pnpm for workspace installs
RUN corepack enable && corepack prepare pnpm@10.26.2 --activate

# Copy package files and lockfile (root pnpm-lock.yaml) so install is deterministic
COPY backend/package*.json ./
COPY pnpm-lock.yaml ./
COPY backend/tsconfig.json ./
COPY backend ./

RUN pnpm install --no-frozen-lockfile
# Generate Prisma client before build
RUN pnpm prisma generate --schema=prisma/schema.prisma
# Verify generated client exists in common pnpm layouts (either direct or inside .pnpm store)
RUN if [ -d node_modules/@prisma/client ] || (ls node_modules/.pnpm 2>/dev/null | grep -q '@prisma+client'); then echo "Prisma client generated"; else echo "Prisma client generation failed: generated client not found" && exit 1; fi
RUN pnpm run build

FROM node:18-bullseye-slim AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy production node_modules and built output from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY backend/package*.json ./

EXPOSE 3000
CMD ["node", "dist/app.js"]
