-- CreateTable
CREATE TABLE "Provider" (
    "id" SERIAL NOT NULL,
    "strapiId" TEXT NOT NULL,
    "strapidocumentId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "strapiCode" TEXT NOT NULL,
    "strapiRole" TEXT[],
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "publishedAt" TIMESTAMP(3),
    "locale" TEXT,

    CONSTRAINT "Provider_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Provider_strapiId_key" ON "Provider"("strapiId");

-- CreateIndex
CREATE UNIQUE INDEX "Provider_strapidocumentId_key" ON "Provider"("strapidocumentId");

-- CreateIndex
CREATE UNIQUE INDEX "Provider_name_key" ON "Provider"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Provider_strapiCode_key" ON "Provider"("strapiCode");
