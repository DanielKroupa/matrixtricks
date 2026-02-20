-- CreateTable
CREATE TABLE "user_write_block" (
    "id" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "startsAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endsAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "scopeCommentCreate" BOOLEAN NOT NULL DEFAULT true,
    "scopeCommentUpdate" BOOLEAN NOT NULL DEFAULT true,
    "scopeCommentDelete" BOOLEAN NOT NULL DEFAULT true,
    "scopeFanwallCreate" BOOLEAN NOT NULL DEFAULT true,
    "scopeFanwallUpdate" BOOLEAN NOT NULL DEFAULT true,
    "scopeFanwallDelete" BOOLEAN NOT NULL DEFAULT true,
    "targetUserId" TEXT,
    "targetDeviceId" TEXT,
    "targetIp" TEXT,
    "createdByUserId" TEXT NOT NULL,
    "revokedByUserId" TEXT,

    CONSTRAINT "user_write_block_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_identity_log" (
    "id" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT,
    "deviceId" TEXT,
    "ipAddress" TEXT,

    CONSTRAINT "user_identity_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_block_audit_event" (
    "id" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "reason" TEXT,
    "details" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "blockId" TEXT,
    "performedByUserId" TEXT,
    "targetUserId" TEXT,
    "targetDeviceId" TEXT,
    "targetIp" TEXT,

    CONSTRAINT "user_block_audit_event_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "user_write_block_isActive_endsAt_idx" ON "user_write_block"("isActive", "endsAt");

-- CreateIndex
CREATE INDEX "user_write_block_targetUserId_isActive_idx" ON "user_write_block"("targetUserId", "isActive");

-- CreateIndex
CREATE INDEX "user_write_block_targetDeviceId_isActive_idx" ON "user_write_block"("targetDeviceId", "isActive");

-- CreateIndex
CREATE INDEX "user_write_block_targetIp_isActive_idx" ON "user_write_block"("targetIp", "isActive");

-- CreateIndex
CREATE INDEX "user_identity_log_userId_createdAt_idx" ON "user_identity_log"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "user_identity_log_deviceId_createdAt_idx" ON "user_identity_log"("deviceId", "createdAt");

-- CreateIndex
CREATE INDEX "user_identity_log_ipAddress_createdAt_idx" ON "user_identity_log"("ipAddress", "createdAt");

-- CreateIndex
CREATE INDEX "user_block_audit_event_blockId_createdAt_idx" ON "user_block_audit_event"("blockId", "createdAt");

-- CreateIndex
CREATE INDEX "user_block_audit_event_performedByUserId_createdAt_idx" ON "user_block_audit_event"("performedByUserId", "createdAt");

-- CreateIndex
CREATE INDEX "user_block_audit_event_targetUserId_createdAt_idx" ON "user_block_audit_event"("targetUserId", "createdAt");

-- AddForeignKey
ALTER TABLE "user_write_block" ADD CONSTRAINT "user_write_block_targetUserId_fkey" FOREIGN KEY ("targetUserId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_write_block" ADD CONSTRAINT "user_write_block_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_write_block" ADD CONSTRAINT "user_write_block_revokedByUserId_fkey" FOREIGN KEY ("revokedByUserId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_identity_log" ADD CONSTRAINT "user_identity_log_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_block_audit_event" ADD CONSTRAINT "user_block_audit_event_blockId_fkey" FOREIGN KEY ("blockId") REFERENCES "user_write_block"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_block_audit_event" ADD CONSTRAINT "user_block_audit_event_performedByUserId_fkey" FOREIGN KEY ("performedByUserId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
