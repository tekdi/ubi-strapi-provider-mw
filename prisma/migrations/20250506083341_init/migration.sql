-- CreateTable
CREATE TABLE "Applications" (
    "id" SERIAL NOT NULL,
    "benefitId" TEXT NOT NULL,
    "status" TEXT NOT NULL,

    CONSTRAINT "Applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApplicationFiles" (
    "id" SERIAL NOT NULL,
    "applicationFilesId" TEXT NOT NULL,
    "applicationId" INTEGER NOT NULL,

    CONSTRAINT "ApplicationFiles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Applications_benefitId_key" ON "Applications"("benefitId");

-- AddForeignKey
ALTER TABLE "ApplicationFiles" ADD CONSTRAINT "ApplicationFiles_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Applications"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
