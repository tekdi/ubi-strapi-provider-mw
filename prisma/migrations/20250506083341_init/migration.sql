-- CreateTable
CREATE TABLE "Applications" (
    "id" SERIAL NOT NULL,
    "benefitId" TEXT NOT NULL,
    "status" TEXT NOT NULL,

    CONSTRAINT "Applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApplicationVCs" (
    "id" SERIAL NOT NULL,
    "applicationFilesId" TEXT NOT NULL,
    "applicationId" INTEGER NOT NULL,

    CONSTRAINT "ApplicationVCs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Applications_benefitId_key" ON "Applications"("benefitId");

-- AddForeignKey
ALTER TABLE "ApplicationVCs" ADD CONSTRAINT "ApplicationVCs_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Applications"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
