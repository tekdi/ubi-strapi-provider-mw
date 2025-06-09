-- CreateTable
CREATE TABLE "Provider" (
    "id" SERIAL NOT NULL,
    "catalogManagerId" TEXT NOT NULL,
    "catalogManagerDocumentId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "catalogManagerCode" TEXT NOT NULL,
    "catalogManagerRole" TEXT[],
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "publishedAt" TIMESTAMP(3),
    "locale" TEXT,

    CONSTRAINT "Provider_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Provider_catalogManagerId_key" ON "Provider"("catalogManagerId");

-- CreateIndex
CREATE UNIQUE INDEX "Provider_catalogManagerDocumentId_key" ON "Provider"("catalogManagerDocumentId");

-- CreateIndex
CREATE UNIQUE INDEX "Provider_name_key" ON "Provider"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Provider_catalogManagerCode_key" ON "Provider"("catalogManagerCode");
