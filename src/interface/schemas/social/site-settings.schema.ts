import { z } from "zod";

export const siteTitleSchema = z.object({
  title: z
    .string()
    .trim()
    .nonempty({ message: "Title is required" })
    .min(3, { message: "Title must be at least 3 characters long" })
    .max(120, { message: "Title must be at most 120 characters long" }),
});

export const siteBioSchema = z.object({
  bio: z
    .string()
    .trim()
    .nonempty({ message: "Bio is required" })
    .min(3, { message: "Bio must be at least 3 characters long" })
    .max(220, { message: "Bio must be at most 220 characters long" }),
});
