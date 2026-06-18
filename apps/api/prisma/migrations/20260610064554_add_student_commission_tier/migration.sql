-- CreateEnum
CREATE TYPE "StudentCommissionTier" AS ENUM ('AUTO', 'STANDARD', 'PREMIUM');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "commissionTier" "StudentCommissionTier" NOT NULL DEFAULT 'AUTO';
