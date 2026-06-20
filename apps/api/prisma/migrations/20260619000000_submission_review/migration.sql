-- AlterTable
ALTER TABLE "ExerciseSubmission" ADD COLUMN IF NOT EXISTS "feedback" TEXT;
ALTER TABLE "ExerciseSubmission" ADD COLUMN IF NOT EXISTS "reviewedAt" TIMESTAMP(3);
ALTER TABLE "ExerciseSubmission" ADD COLUMN IF NOT EXISTS "reviewedById" TEXT;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "ExerciseSubmission_status_submittedAt_idx" ON "ExerciseSubmission"("status", "submittedAt");
