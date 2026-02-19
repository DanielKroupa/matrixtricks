-- CreateTable
CREATE TABLE "vip_price_audit_event" (
    "id" TEXT NOT NULL,
    "currency" TEXT NOT NULL,
    "previousPriceId" TEXT,
    "nextPriceId" TEXT,
    "previousIsActive" BOOLEAN,
    "nextIsActive" BOOLEAN NOT NULL,
    "changedByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vip_price_audit_event_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "vip_price_audit_event_currency_createdAt_idx" ON "vip_price_audit_event"("currency", "createdAt");

-- CreateIndex
CREATE INDEX "vip_price_audit_event_changedByUserId_idx" ON "vip_price_audit_event"("changedByUserId");

-- AddForeignKey
ALTER TABLE "vip_price_audit_event" ADD CONSTRAINT "vip_price_audit_event_changedByUserId_fkey" FOREIGN KEY ("changedByUserId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
