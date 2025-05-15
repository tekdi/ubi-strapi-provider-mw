-- AlterTable
ALTER TABLE "Applications" ADD COLUMN     "actionLog" JSONB,
ADD COLUMN     "updatedBy" INTEGER;
