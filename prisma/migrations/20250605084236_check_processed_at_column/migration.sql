-- AlterTable
ALTER TABLE "Applications" ADD COLUMN     "documentVerificationStatus" TEXT,
ADD COLUMN     "eligibilityCheckedAt" TIMESTAMP(3),
ADD COLUMN     "eligibilityResult" JSONB,
ADD COLUMN     "eligibilityStatus" TEXT DEFAULT 'pending';
