-- AlterTable
ALTER TABLE "user" ADD COLUMN     "deleteAfterAt" TIMESTAMP(3),
ADD COLUMN     "pendingDeletionAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "user_deleteAfterAt_idx" ON "user"("deleteAfterAt");
