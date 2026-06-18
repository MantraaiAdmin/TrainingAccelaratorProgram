#!/bin/bash
set -e

echo "🚀 Starting Constel AI NextGen..."

if [ ! -f .env ]; then
  cp .env.example .env
  echo "📝 Created .env from .env.example"
fi

docker compose up -d postgres redis

echo "⏳ Waiting for PostgreSQL..."
until docker compose exec -T postgres pg_isready -U constel -d constel_nextgen > /dev/null 2>&1; do
  sleep 1
done

echo "📦 Installing dependencies..."
npm install

echo "🔧 Building packages..."
npm run build --workspace=@constel/types
npm run build --workspace=@constel/config
npm run build --workspace=@constel/ai-sdk

echo "🗄️ Running migrations..."
cd apps/api && npx prisma generate && npx prisma migrate dev --name init && npx ts-node prisma/seed.ts && cd ../..

echo "✅ Setup complete! Run 'npm run dev' to start development servers."
echo ""
echo "📋 Demo Credentials:"
echo "  Student: student@demo.com / Demo@123"
echo "  Admin:   admin@constel.ai / Demo@123"
