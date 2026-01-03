#!/bin/sh

echo "Starting backend container..."
echo "DATABASE_URL is set: $(echo $DATABASE_URL | sed 's/:.*@/:***@/')"
echo "Running database migrations..."

# Try migration but don't fail if it errors (for debugging)
npx prisma migrate deploy || echo "WARNING: Migration failed, continuing anyway..."

echo "Starting server..."
exec node dist/server.js
