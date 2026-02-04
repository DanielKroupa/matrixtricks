import { z } from "zod";

export const updateProfileSchema = z.object({
  nickname: z
    .string()
    .min(1, { message: "Nickname is required" })
    .min(3, { message: "Nickname must be at least 2 characters long" })
    .max(30, { message: "Nickname must be at most 30 characters long" })
    .regex(
      /^[a-zA-Z0-9_.]+$/,
      "Username can only contain letters, numbers, underscores, and dots",
    ),
  image: z.string().nullable().optional(),
});

export type UpdateProfileFormData = z.infer<typeof updateProfileSchema>;
