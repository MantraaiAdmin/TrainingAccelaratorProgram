-- Idempotent repair: production DB may be missing enum/column expected by current Prisma client.
DO $$ BEGIN
    CREATE TYPE "StudentCommissionTier" AS ENUM ('AUTO', 'STANDARD', 'PREMIUM');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "commissionTier" "StudentCommissionTier" NOT NULL DEFAULT 'AUTO';
