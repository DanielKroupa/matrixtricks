-- CreateEnum
CREATE TYPE "ChatThreadStatus" AS ENUM ('OPEN', 'ARCHIVED', 'BLOCKED');

-- CreateTable
CREATE TABLE "chat_thread" (
    "id" TEXT NOT NULL,
    "status" "ChatThreadStatus" NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastMessageAt" TIMESTAMP(3),
    "archivedAt" TIMESTAMP(3),
    "blockedAt" TIMESTAMP(3),
    "unreadForUser" INTEGER NOT NULL DEFAULT 0,
    "unreadForAdmin" INTEGER NOT NULL DEFAULT 0,
    "userId" TEXT NOT NULL,
    "blockedByUserId" TEXT,

    CONSTRAINT "chat_thread_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chat_message" (
    "id" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "threadId" TEXT NOT NULL,
    "senderUserId" TEXT NOT NULL,

    CONSTRAINT "chat_message_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "chat_thread_status_updatedAt_idx" ON "chat_thread"("status", "updatedAt");

-- CreateIndex
CREATE INDEX "chat_thread_lastMessageAt_idx" ON "chat_thread"("lastMessageAt");

-- CreateIndex
CREATE UNIQUE INDEX "chat_thread_userId_key" ON "chat_thread"("userId");

-- CreateIndex
CREATE INDEX "chat_message_threadId_createdAt_idx" ON "chat_message"("threadId", "createdAt");

-- CreateIndex
CREATE INDEX "chat_message_senderUserId_createdAt_idx" ON "chat_message"("senderUserId", "createdAt");

-- AddForeignKey
ALTER TABLE "chat_thread" ADD CONSTRAINT "chat_thread_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_thread" ADD CONSTRAINT "chat_thread_blockedByUserId_fkey" FOREIGN KEY ("blockedByUserId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_message" ADD CONSTRAINT "chat_message_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "chat_thread"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_message" ADD CONSTRAINT "chat_message_senderUserId_fkey" FOREIGN KEY ("senderUserId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
