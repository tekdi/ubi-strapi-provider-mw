/*
  Warnings:

  - You are about to drop the `ApplicationFiles` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ApplicationFiles" DROP CONSTRAINT "ApplicationFiles_applicationId_fkey";

-- DropTable
DROP TABLE "ApplicationFiles";

-- CreateTable
CREATE TABLE "ApplicationFiles" (
    "id" SERIAL NOT NULL,
    "storage" TEXT NOT NULL,
    "filePath" TEXT,
    "verificationStatus" JSONB,
    "applicationId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ApplicationFiles_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ApplicationFiles" ADD CONSTRAINT "ApplicationFiles_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Applications"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
