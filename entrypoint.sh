#!/bin/sh
set -e

echo "▶ Running database migrations..."
npx prisma migrate deploy

echo "▶ Seeding default admin user and settings..."
npm run db:seed

echo "▶ Starting Villa Management..."
exec npm start
