/*
  Warnings:

  - You are about to drop the column `processedAt` on the `Applications` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Applications" DROP COLUMN "processedAt",
ADD COLUMN     "calculationsProcessedAt" TIMESTAMP(3);
