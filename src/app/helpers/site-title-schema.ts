import { z } from "zod";

export const siteTitleSchema = z.object({
  title: z
    .string()
    .trim()
    .nonempty({ message: "Title is required" })
    .min(3, { message: "Title must be at least 3 characters long" })
    .max(120, { message: "Title must be at most 120 characters long" }),
});

export type SiteTitleFormData = z.infer<typeof siteTitleSchema>;
