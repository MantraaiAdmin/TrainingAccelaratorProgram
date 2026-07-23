import { Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const logger = new Logger('DatabaseRepair');

/**
 * Idempotent schema repairs for production DBs that lag behind Prisma migrations.
 * Safe to run on every API boot — no-ops when schema is already current.
 */
export async function repairProductionSchema(prisma: PrismaClient): Promise<void> {
  const repairs: Array<{ name: string; sql: string }> = [
    {
      name: 'StudentCommissionTier enum',
      sql: `
        DO $$ BEGIN
          CREATE TYPE "StudentCommissionTier" AS ENUM ('AUTO', 'STANDARD', 'PREMIUM');
        EXCEPTION
          WHEN duplicate_object THEN null;
        END $$;
      `,
    },
    {
      name: 'User.commissionTier column',
      sql: `
        ALTER TABLE "User"
        ADD COLUMN IF NOT EXISTS "commissionTier" "StudentCommissionTier" NOT NULL DEFAULT 'AUTO';
      `,
    },
    {
      name: 'Track.priceInr column',
      sql: `
        ALTER TABLE "Track"
        ADD COLUMN IF NOT EXISTS "priceInr" INTEGER NOT NULL DEFAULT 4999;
      `,
    },
    {
      name: 'ExerciseSubmission review columns',
      sql: `
        ALTER TABLE "ExerciseSubmission" ADD COLUMN IF NOT EXISTS "feedback" TEXT;
        ALTER TABLE "ExerciseSubmission" ADD COLUMN IF NOT EXISTS "reviewedAt" TIMESTAMP(3);
        ALTER TABLE "ExerciseSubmission" ADD COLUMN IF NOT EXISTS "reviewedById" TEXT;
      `,
    },
  ];

  for (const repair of repairs) {
    try {
      await prisma.$executeRawUnsafe(repair.sql);
      logger.log(`Schema repair applied: ${repair.name}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      logger.warn(`Schema repair skipped (${repair.name}): ${message}`);
    }
  }
}
