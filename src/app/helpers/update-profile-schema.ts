import { z } from "zod";

export const updateProfileSchema = z.object({
  nickname: z
    .string()
    .nonempty({ message: "Nickname is required" })
    .min(1, { message: "Nickname is required" })
    .min(3, { message: "Nickname must be at least 3 characters long" })
    .max(30, { message: "Nickname must be at most 30 characters long" })
    .regex(
      /^[a-zA-Z0-9_.]+$/,
      "Username can only contain letters, numbers, underscores, and dots",
    ),
  title: z
    .string()
    .trim()
    .min(1, { message: "Title is required" })
    .max(120, { message: "Title must be at most 120 characters long" }),
  bio: z
    .string()
    .trim()
    .min(1, { message: "Bio is required" })
    .max(220, { message: "Bio must be at most 220 characters long" }),
});

export type UpdateProfileFormData = z.infer<typeof updateProfileSchema>;
