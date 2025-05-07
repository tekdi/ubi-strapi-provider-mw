/*
  Warnings:

  - Changed the type of `status` on the `Applications` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('pending', 'approved', 'rejected');

-- AlterTable
ALTER TABLE "Applications" DROP COLUMN "status",
ADD COLUMN     "status" "ApplicationStatus" NOT NULL;
