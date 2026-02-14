-- AlterTable
ALTER TABLE "post" ADD COLUMN     "isPinned" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "pinnedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "post_rubric_isPinned_pinnedAt_idx" ON "post"("rubric", "isPinned", "pinnedAt");
