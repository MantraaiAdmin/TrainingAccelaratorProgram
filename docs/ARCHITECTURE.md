# Constel AI NextGen - System Architecture

## Overview

Constel AI NextGen is a production-ready internship learning and management platform built as a Turborepo monorepo for **Constel Global India Pvt. Ltd.**

```
┌─────────────────────────────────────────────────────────────────┐
│                        Client Layer                              │
│  Next.js 15 (App Router) + TailwindCSS + shadcn/ui + Monaco   │
└──────────────────────────┬──────────────────────────────────────┘
                           │ REST API / SSE Streaming
┌──────────────────────────▼──────────────────────────────────────┐
│                     API Gateway (NestJS)                         │
│  Auth (JWT) │ RBAC │ Rate Limiting │ Swagger │ WebSocket-ready  │
└──────┬──────────┬──────────┬──────────┬──────────┬─────────────┘
       │          │          │          │          │
┌──────▼──┐ ┌─────▼────┐ ┌──▼───┐ ┌───▼────┐ ┌──▼──────────┐
│ Prisma  │ │ Code Exec│ │ AI   │ │Storage │ │ Gamification│
│PostgreSQL│ │ Docker   │ │ Qwen │ │ S3/R2  │ │ XP/Badges   │
└─────────┘ └──────────┘ └──────┘ └────────┘ └─────────────┘
```

## Monorepo Structure

```
constel-ai-nextgen/
├── apps/
│   ├── web/          # Next.js frontend
│   └── api/          # NestJS backend
├── packages/
│   ├── types/        # Shared TypeScript types
│   ├── config/       # App config, XP, constants
│   ├── ai-sdk/       # AI provider abstraction (Qwen, OpenAI, etc.)
│   └── ui/           # Shared UI components (future)
├── infra/
│   ├── docker/       # Dockerfiles
│   ├── nginx/        # Reverse proxy config
│   └── scripts/      # Setup scripts
└── docker-compose.yml
```

## Track Architecture

Tracks are **not segregated by academic year**. Students see progression:

```
Beginner → Intermediate → Advanced
```

- Students access **only admin-assigned tracks**
- No self-enrollment
- Placeholder tracks ready for future integration
- Prerequisites configurable per track (optional)

## Phase 1 Implementation

| Track | Status |
|-------|--------|
| Basics of Python | ✅ Fully implemented (6 modules, 50+ lessons/exercises) |
| 9 other tracks | 🔒 Placeholder-ready |

## Database Schema

Core entities: `User`, `Track`, `Module`, `Chapter`, `Subsection`, `Lesson`, `CodingExercise`, `Quiz`, `Assignment`, `MiniProject`, `CapstoneProject`, `Certificate`, `AIChat`, `XPHistory`, `Achievement`

See `apps/api/prisma/schema.prisma` for complete schema.

## AI Integration

```
┌──────────────┐     ┌─────────────────┐     ┌──────────────┐
│  AI Panel    │────▶│  AI Service     │────▶│ Qwen API     │
│  (Frontend)  │     │  (NestJS)       │     │ (Primary)    │
└──────────────┘     │                 │     └──────────────┘
                     │  Provider       │────▶ OpenAI (fallback)
                     │  Factory        │────▶ Claude/Gemini/Ollama
                     └─────────────────┘
```

- Streaming responses via SSE
- Context-aware (lesson, exercise, student code, errors)
- Mock interview simulation
- Token optimization via conversation history trimming

## Code Execution Engine

```
Student Code → API → Docker Sandbox (production) / Local Python (dev)
                  → Timeout: 10s, Memory: 128MB
                  → Test case evaluation (visible + hidden)
                  → XP reward on pass
```

## Security

- JWT + Refresh tokens
- RBAC (STUDENT, ADMIN, SUPER_ADMIN, MENTOR)
- Rate limiting (Throttler)
- Helmet security headers
- Input validation (class-validator)
- Docker sandbox isolation for code execution

## Scalability (500 concurrent students)

- Redis for caching and job queues (ready)
- AI provider fallback chain
- Async code execution queue (architecture ready)
- PostgreSQL with optimized indexes
- Horizontal scaling via Docker Compose / K8s

## Deployment Targets

- **Local**: `docker compose up` or `npm run dev`
- **VPS/AWS EC2**: Docker Compose + nginx
- **Railway/Render**: Dockerfile deployment
