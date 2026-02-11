/*
  Warnings:

  - You are about to drop the column `rubricId` on the `post` table. All the data in the column will be lost.
  - You are about to drop the `rubric` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `rubric` to the `post` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "RubricType" AS ENUM ('TEXTS', 'BASICS', 'VIDEOS', 'TRICKS');

-- DropForeignKey
ALTER TABLE "post" DROP CONSTRAINT "post_rubricId_fkey";

-- DropIndex
DROP INDEX "post_rubricId_idx";

-- AlterTable
ALTER TABLE "post" DROP COLUMN "rubricId",
ADD COLUMN     "rubric" "RubricType" NOT NULL;

-- DropTable
DROP TABLE "rubric";

-- CreateIndex
CREATE INDEX "post_rubric_idx" ON "post"("rubric");
