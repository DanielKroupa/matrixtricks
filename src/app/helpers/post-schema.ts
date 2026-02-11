import { z } from "zod";

export const postSchema = z.object({
  title: z
    .string()
    .nonempty({ message: "Title is required" })
    .min(1, { message: "Title is required" })
    .max(200, { message: "Title must be at most 200 characters" }),
  content: z.string().optional(),
  type: z.enum(["text", "media"], { required_error: "Type is required" }),
  rubric: z.enum(["TEXTS", "BASICS", "VIDEOS", "TRICKS"], {
    required_error: "Rubric is required",
  }),
  scheduledAt: z
    .string()
    .optional()
    .transform((val) => (val ? new Date(val) : undefined)),
});

export type PostFormData = z.infer<typeof postSchema>;
