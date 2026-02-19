-- CreateTable
CREATE TABLE "vip_price" (
    "id" TEXT NOT NULL,
    "currency" TEXT NOT NULL,
    "priceId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vip_price_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "vip_price_currency_key" ON "vip_price"("currency");

-- CreateIndex
CREATE INDEX "vip_price_isActive_idx" ON "vip_price"("isActive");
