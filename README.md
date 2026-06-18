# Constel AI NextGen

**Internship Learning & Management Platform** by Constel Global India Pvt. Ltd.

A production-ready web application for college students (2nd–4th year) featuring interactive Python learning, AI-powered assistance, gamification, and enterprise admin tools.

![Stack](https://img.shields.io/badge/Next.js-15-black) ![NestJS](https://img.shields.io/badge/NestJS-11-red) ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue)

## Features

- **Learning Tracks** — Beginner → Intermediate → Advanced progression (not year-based)
- **Basics of Python** — Fully implemented with 6 modules, 50+ lessons & coding exercises
- **Monaco Code Editor** — Syntax highlighting, run/submit, AI hints
- **Secure Code Execution** — Docker sandbox with timeout & memory limits
- **AI Learning Assistant** — Qwen-powered chat with lesson context (streaming)
- **Gamification** — XP, levels, streaks, badges, leaderboard
- **Quizzes** — MCQ, code output prediction, instant evaluation
- **Assignments & Projects** — Mini projects, capstone, interview prep
- **Certificates** — QR-verified, admin override
- **Admin Panel** — Student management, analytics, finance dashboard
- **9 Placeholder Tracks** — Ready for future integration

## Quick Start (Local)

### Prerequisites

- Node.js 20+
- Docker & Docker Compose
- Python 3 (for local code execution in dev mode)

### One-Command Setup

```bash
# Clone and enter project
cd "Constel AI NextGEN"

# Copy environment file
cp .env.example .env

# Start PostgreSQL & Redis
docker compose up -d postgres redis

# Run setup script
chmod +x infra/scripts/setup.sh
./infra/scripts/setup.sh

# Start development servers
npm run dev
```

### Manual Setup

```bash
cp .env.example .env
docker compose up -d postgres redis
npm install
npm run build --workspace=@constel/types
npm run build --workspace=@constel/config
npm run build --workspace=@constel/ai-sdk
cd apps/api && npx prisma generate && npx prisma migrate dev --name init && npx ts-node prisma/seed.ts && cd ../..
npm run dev
```

### Access

| Service | URL |
|---------|-----|
| Web App | http://localhost:3000 |
| API | http://localhost:4000 |
| Swagger Docs | http://localhost:4000/api/docs |

### Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Student | student@demo.com | Demo@123 |
| Admin | admin@constel.ai | Demo@123 |
| Super Admin | superadmin@constel.ai | Demo@123 |

## Docker Compose (Full Stack)

```bash
# Set Qwen API key in .env
QWEN_API_KEY=your-dashscope-api-key

# Build and start everything
docker compose up -d --build

# View logs
docker compose logs -f
```

## AI Configuration (Qwen)

1. Get API key from [DashScope](https://dashscope.aliyun.com/)
2. Add to `.env`:
   ```
   QWEN_API_KEY=sk-your-key
   QWEN_MODEL=qwen-turbo
   AI_PROVIDER=qwen
   ```

The AI assistant works without a key but will show an error message. All other features work independently.

## Project Structure

```
apps/
  web/          Next.js 15 frontend
  api/          NestJS backend + Prisma
packages/
  types/        Shared TypeScript types
  config/       App constants, XP config
  ai-sdk/       AI provider abstraction layer
infra/
  docker/       Dockerfiles
  nginx/        Reverse proxy
  scripts/      Setup scripts
docs/
  ARCHITECTURE.md
```

## Tech Stack

**Frontend:** Next.js 15, TypeScript, TailwindCSS, shadcn/ui, Monaco Editor, Framer Motion, TanStack Query, Zustand, Recharts

**Backend:** NestJS, Prisma, PostgreSQL, JWT, Swagger, Helmet, Throttler

**AI:** Qwen (DashScope) with fallback architecture for OpenAI/Claude/Gemini/Ollama

**DevOps:** Docker, Docker Compose, GitHub Actions CI/CD, nginx

## Testing

```bash
# Unit tests
npm run test --workspace=@constel/api

# E2E (requires running app)
npm run test:e2e --workspace=@constel/web
```

## API Documentation

Swagger UI available at `/api/docs` when API is running.

Key endpoints:
- `POST /api/v1/auth/login` — Authentication
- `GET /api/v1/tracks` — List tracks
- `GET /api/v1/tracks/:slug` — Track content
- `POST /api/v1/code/run` — Run Python code
- `POST /api/v1/code/submit/:exerciseId` — Submit exercise
- `POST /api/v1/ai/chat` — AI assistant
- `GET /api/v1/progress/dashboard` — Student dashboard
- `GET /api/v1/admin/analytics` — Admin analytics

## Deployment

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for deployment to VPS, AWS EC2, Railway, or Render.

### Production Checklist

- [ ] Change JWT secrets in `.env`
- [ ] Configure Qwen API key
- [ ] Set up SMTP for email OTP
- [ ] Configure S3/R2 storage
- [ ] Enable Docker sandbox (`USE_DOCKER_SANDBOX=true`)
- [ ] Set up nginx reverse proxy
- [ ] Configure Razorpay/Stripe payment keys

## License

Proprietary — Constel Global India Pvt. Ltd.
