#!/bin/sh
set -e

# Auto-generate AUTH_SECRET once and persist it in the data volume
if [ -z "$AUTH_SECRET" ]; then
  SECRET_FILE="/app/data/.auth_secret"
  if [ ! -f "$SECRET_FILE" ]; then
    echo "▶ Generating AUTH_SECRET..."
    openssl rand -base64 32 > "$SECRET_FILE"
  fi
  export AUTH_SECRET=$(cat "$SECRET_FILE")
fi


echo "▶ Running database migrations..."
npx prisma migrate deploy

echo "▶ Seeding default admin user and settings..."
npm run db:seed

echo "▶ Starting Villa Management..."
exec npm start
