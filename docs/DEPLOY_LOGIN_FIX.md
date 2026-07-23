# Login fix deployment (learn.mantraai.cloud)

Production login failed because the Render PostgreSQL schema lagged behind the API Prisma client (`User.commissionTier` missing → every auth query returned 500).

## Required Vercel environment variables

In **Vercel → learn.mantraai.cloud project → Settings → Environment Variables**, add:

| Variable | Value source |
|----------|----------------|
| `DATABASE_URL` | Render Dashboard → `mantra-learn-db` → Connect → **External** connection string |
| `JWT_SECRET` | Render Dashboard → `mantra-learn-api` → Environment → `JWT_SECRET` (must match API) |
| `JWT_EXPIRES_IN` | `15m` (optional, defaults to 15m) |

Redeploy Vercel after saving env vars.

The web login route (`/api/auth/login`) now performs direct DB auth when these vars are set, repairs schema on login, and falls back to Render API otherwise.

## Render API redeploy (recommended)

Render is **not auto-deploying** from GitHub in the current setup. Manually redeploy:

1. Render Dashboard → **mantra-learn-api** → **Manual Deploy** → Deploy latest commit
2. Verify: `curl https://mantra-learn-api.onrender.com/api/v1/health/db`
3. Verify login: demo `student@demo.com` / `Demo@123`

## Demo credentials

- `student@demo.com` / `Demo@123`

Ensure email spelling is exact (e.g. `@mantraai.cloud`, not `@Mantraal.cloud`).
