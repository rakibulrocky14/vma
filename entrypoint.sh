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

# Auto-detect server IP for NEXTAUTH_URL if not set
if [ -z "$NEXTAUTH_URL" ]; then
  SERVER_IP=$(curl -s --max-time 3 https://ifconfig.me 2>/dev/null || hostname -I | awk '{print $1}')
  if [ -n "$SERVER_IP" ]; then
    export NEXTAUTH_URL="http://${SERVER_IP}:3000"
    echo "▶ Auto-detected NEXTAUTH_URL: $NEXTAUTH_URL"
  else
    export NEXTAUTH_URL="http://localhost:3000"
  fi
fi

echo "▶ Running database migrations..."
npx prisma migrate deploy

echo "▶ Seeding default admin user and settings..."
npm run db:seed

echo "▶ Starting Villa Management..."
exec npm start
