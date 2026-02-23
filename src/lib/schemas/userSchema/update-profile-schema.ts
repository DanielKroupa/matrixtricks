import { z } from "zod";

export const updateProfileSchema = z.object({
  nickname: z
    .string()
    .nonempty({ message: "Nickname must not be empty" })
    .min(3, { message: "Nickname must be at least 3 characters long" })
    .max(30, { message: "Nickname must be at most 30 characters long" })
    .regex(
      /^[a-zA-Z0-9_.]+$/,
      "Nickname can only contain letters, numbers, underscores, and dots",
    ),
  title: z
    .string()
    .trim()
    .nonempty({ message: "Title must not be empty" })
    .min(3, { message: "Title must be at least 3 characters long" })
    .max(120, { message: "Title must be at most 120 characters long" }),
  bio: z
    .string()
    .trim()
    .nonempty({ message: "Bio must not be empty" })
    .max(220, { message: "Bio must be max 220 characters long" }),
});

export type UpdateProfileFormData = z.infer<typeof updateProfileSchema>;
