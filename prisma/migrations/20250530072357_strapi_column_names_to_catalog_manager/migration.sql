/*
  Warnings:

  - You are about to drop the column `strapiCode` on the `Provider` table. All the data in the column will be lost.
  - You are about to drop the column `strapiId` on the `Provider` table. All the data in the column will be lost.
  - You are about to drop the column `strapiRole` on the `Provider` table. All the data in the column will be lost.
  - You are about to drop the column `strapidocumentId` on the `Provider` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[catalogManagerId]` on the table `Provider` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[catalogManagerDocumentId]` on the table `Provider` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[catalogManagerCode]` on the table `Provider` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `catalogManagerCode` to the `Provider` table without a default value. This is not possible if the table is not empty.
  - Added the required column `catalogManagerDocumentId` to the `Provider` table without a default value. This is not possible if the table is not empty.
  - Added the required column `catalogManagerId` to the `Provider` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Provider_strapiCode_key";

-- DropIndex
DROP INDEX "Provider_strapiId_key";

-- DropIndex
DROP INDEX "Provider_strapidocumentId_key";

-- AlterTable
ALTER TABLE "Provider" DROP COLUMN "strapiCode",
DROP COLUMN "strapiId",
DROP COLUMN "strapiRole",
DROP COLUMN "strapidocumentId",
ADD COLUMN     "catalogManagerCode" TEXT NOT NULL,
ADD COLUMN     "catalogManagerDocumentId" TEXT NOT NULL,
ADD COLUMN     "catalogManagerId" TEXT NOT NULL,
ADD COLUMN     "catalogManagerRole" TEXT[];

-- CreateIndex
CREATE UNIQUE INDEX "Provider_catalogManagerId_key" ON "Provider"("catalogManagerId");

-- CreateIndex
CREATE UNIQUE INDEX "Provider_catalogManagerDocumentId_key" ON "Provider"("catalogManagerDocumentId");

-- CreateIndex
CREATE UNIQUE INDEX "Provider_catalogManagerCode_key" ON "Provider"("catalogManagerCode");
