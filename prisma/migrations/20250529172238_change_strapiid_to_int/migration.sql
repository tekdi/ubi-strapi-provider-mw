/*
  Warnings:

  - Changed the type of `strapiId` on the `Provider` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Provider" DROP COLUMN "strapiId",
ADD COLUMN     "strapiId" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Provider_strapiId_key" ON "Provider"("strapiId");
