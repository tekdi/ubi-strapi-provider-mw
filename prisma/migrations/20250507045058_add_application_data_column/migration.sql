/*
  Warnings:

  - Made the column `applicationData` on table `Applications` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Applications" ALTER COLUMN "applicationData" SET NOT NULL;
