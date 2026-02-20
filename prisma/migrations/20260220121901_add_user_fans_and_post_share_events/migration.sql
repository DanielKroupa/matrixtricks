-- CreateTable
CREATE TABLE "user_fan" (
    "id" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "deviceId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "activatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deactivatedAt" TIMESTAMP(3),
    "targetUserId" TEXT NOT NULL,
    "sourceUserId" TEXT,

    CONSTRAINT "user_fan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "post_share" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "postId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "post_share_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "user_fan_targetUserId_isActive_idx" ON "user_fan"("targetUserId", "isActive");

-- CreateIndex
CREATE INDEX "user_fan_sourceUserId_idx" ON "user_fan"("sourceUserId");

-- CreateIndex
CREATE UNIQUE INDEX "user_fan_targetUserId_deviceId_key" ON "user_fan"("targetUserId", "deviceId");

-- CreateIndex
CREATE INDEX "post_share_userId_createdAt_idx" ON "post_share"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "post_share_postId_createdAt_idx" ON "post_share"("postId", "createdAt");

-- AddForeignKey
ALTER TABLE "user_fan" ADD CONSTRAINT "user_fan_targetUserId_fkey" FOREIGN KEY ("targetUserId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_fan" ADD CONSTRAINT "user_fan_sourceUserId_fkey" FOREIGN KEY ("sourceUserId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_share" ADD CONSTRAINT "post_share_postId_fkey" FOREIGN KEY ("postId") REFERENCES "post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_share" ADD CONSTRAINT "post_share_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
