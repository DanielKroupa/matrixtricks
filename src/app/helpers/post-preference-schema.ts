import { z } from "zod";

const allowedPostsPerPage = [10, 20, 50] as const;

export const postPreferenceSchema = z.object({
  rubric: z.enum(["VIDEOS", "TEXTS", "BASICS", "TRICKS"]),
  postsPerPage: z.union(
    allowedPostsPerPage.map((value) => z.literal(value)) as [
      z.ZodLiteral<10>,
      z.ZodLiteral<20>,
      z.ZodLiteral<50>,
    ],
  ),
  sortBy: z.enum([
    "newest",
    "oldest",
    "shareCount",
    "likeCount",
    "commentCount",
  ]),
});

export type PostPreferenceInput = z.infer<typeof postPreferenceSchema>;
export { allowedPostsPerPage };
