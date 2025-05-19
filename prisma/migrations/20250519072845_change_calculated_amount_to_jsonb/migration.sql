/*
  Warnings:

  - The `calculatedAmount` column on the `Applications` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Applications" ADD COLUMN     "calculationsProcessedAt" TIMESTAMP(3),
DROP COLUMN "calculatedAmount",
ADD COLUMN     "calculatedAmount" JSONB;
