-- CreateTable
CREATE TABLE "fanwall_message" (
    "id" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "title" TEXT,
    "nickname" TEXT,
    "contact" TEXT,
    "isPinned" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT,

    CONSTRAINT "fanwall_message_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "fanwall_message_userId_idx" ON "fanwall_message"("userId");

-- CreateIndex
CREATE INDEX "fanwall_message_isPinned_createdAt_idx" ON "fanwall_message"("isPinned", "createdAt");

-- AddForeignKey
ALTER TABLE "fanwall_message" ADD CONSTRAINT "fanwall_message_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
