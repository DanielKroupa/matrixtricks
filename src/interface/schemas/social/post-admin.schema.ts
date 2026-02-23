import { z } from "zod";

export const createPostSchema = z.object({
  title: z
    .string()
    .nonempty({ message: "Title is required" })
    .min(1, { message: "Title is required" })
    .max(200, { message: "Title must be at most 200 characters" }),
  content: z.string().optional(),
  type: z.enum(["text", "media"], { message: "Type is required" }),
  rubric: z.enum(["TEXTS", "BASICS", "VIDEOS", "TRICKS"], {
    message: "Rubric is required",
  }),
  scheduledAt: z.string().optional(),
  vipOnly: z.boolean().optional(),
});

export const updatePostSchema = z
  .object({
    title: z.string().min(1).max(255).optional(),
    content: z.string().optional(),
    isPinned: z.boolean().optional(),
  })
  .refine(
    (data) =>
      data.title !== undefined ||
      data.content !== undefined ||
      data.isPinned !== undefined,
    {
      message: "At least one field must be provided",
    },
  );
