-- CreateEnum
CREATE TYPE "PostSortOption" AS ENUM ('NEWEST', 'OLDEST', 'SHARE_COUNT', 'LIKE_COUNT', 'COMMENT_COUNT');

-- CreateTable
CREATE TABLE "user_post_preference" (
    "id" TEXT NOT NULL,
    "rubric" "RubricType" NOT NULL,
    "postsPerPage" INTEGER NOT NULL DEFAULT 10,
    "sortBy" "PostSortOption" NOT NULL DEFAULT 'NEWEST',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "user_post_preference_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "user_post_preference_userId_idx" ON "user_post_preference"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "user_post_preference_userId_rubric_key" ON "user_post_preference"("userId", "rubric");

-- AddForeignKey
ALTER TABLE "user_post_preference" ADD CONSTRAINT "user_post_preference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
