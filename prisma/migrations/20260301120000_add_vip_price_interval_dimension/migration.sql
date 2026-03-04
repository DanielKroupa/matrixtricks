-- CreateEnum
CREATE TYPE "VipBillingInterval" AS ENUM ('MONTHLY', 'SEMIANNUAL', 'YEARLY');

-- AlterTable
ALTER TABLE "vip_price"
ADD COLUMN "interval" "VipBillingInterval" NOT NULL DEFAULT 'MONTHLY';

ALTER TABLE "vip_price_audit_event"
ADD COLUMN "interval" "VipBillingInterval" NOT NULL DEFAULT 'MONTHLY';

-- DropIndex
DROP INDEX "vip_price_currency_key";

DROP INDEX "vip_price_audit_event_currency_createdAt_idx";

-- CreateIndex
CREATE UNIQUE INDEX "vip_price_currency_interval_key" ON "vip_price"("currency", "interval");

CREATE INDEX "vip_price_audit_event_currency_interval_createdAt_idx" ON "vip_price_audit_event"("currency", "interval", "createdAt");

-- AlterTable
ALTER TABLE "vip_price" ALTER COLUMN "interval" DROP DEFAULT;
ALTER TABLE "vip_price_audit_event" ALTER COLUMN "interval" DROP DEFAULT;
