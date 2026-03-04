import { z } from "zod";

export const createPostSchema = z
  .object({
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
    mediaCount: z.number().int().nonnegative().default(0),
    scheduledAt: z.string().optional(),
    vipOnly: z.boolean().optional(),
  })
  .superRefine((data, ctx) => {
    const isMedia = data.type === "media";
    const isText = data.type === "text";

    if (isMedia && data.rubric === "TEXTS") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Media posts cannot use the Texts rubric",
        path: ["rubric"],
      });
    }

    if (isText && data.rubric !== "TEXTS") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Text posts must use the Texts rubric",
        path: ["rubric"],
      });
    }

    if (isMedia && data.mediaCount <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Upload at least one media file",
        path: ["mediaCount"],
      });
    }
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
