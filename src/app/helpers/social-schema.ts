import { z } from "zod";

export const CreateCommentSchema = z.object({
  content: z
    .string()
    .min(1, "Comment cannot be empty")
    .max(500, "Comment is too long"),
  postId: z.string().cuid(),
  nickname: z
    .string()
    .min(2, "Nickname is too short")
    .max(30, "Nickname is too long")
    .optional(),
});

export const ToggleLikeSchema = z.object({
  entityId: z.string().cuid(),
});
