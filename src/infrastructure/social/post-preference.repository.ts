import prisma from "@/lib/prisma";
import type { RubricParam } from "@/types/social";

export type DbSortOption =
  | "NEWEST"
  | "OLDEST"
  | "SHARE_COUNT"
  | "LIKE_COUNT"
  | "COMMENT_COUNT";

export const postPreferenceRepository = {
  async findUserPreference(userId: string, rubric: RubricParam) {
    const rows = await prisma.$queryRaw<
      Array<{ postsPerPage: number; sortBy: DbSortOption }>
    >`
      SELECT "postsPerPage", "sortBy"
      FROM "user_post_preference"
      WHERE "userId" = ${userId} AND "rubric" = ${rubric}::"RubricType"
      LIMIT 1
    `;

    return rows[0] ?? null;
  },

  async upsertUserPreference(input: {
    userId: string;
    rubric: RubricParam;
    postsPerPage: number;
    sortBy: DbSortOption;
  }) {
    await prisma.$queryRaw`
      INSERT INTO "user_post_preference" ("id", "userId", "rubric", "postsPerPage", "sortBy", "createdAt", "updatedAt")
      VALUES (${crypto.randomUUID()}, ${input.userId}, ${input.rubric}::"RubricType", ${input.postsPerPage}, ${input.sortBy}::"PostSortOption", NOW(), NOW())
      ON CONFLICT ("userId", "rubric")
      DO UPDATE SET
        "postsPerPage" = EXCLUDED."postsPerPage",
        "sortBy" = EXCLUDED."sortBy",
        "updatedAt" = NOW()
    `;
  },
};
