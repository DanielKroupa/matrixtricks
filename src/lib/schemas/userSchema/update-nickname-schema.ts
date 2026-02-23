import { z } from "zod";

export const updateNicknameSchema = z.object({
  nickname: z
    .string()
    .nonempty({ message: "Nickname must not be empty" })
    .min(3, { message: "Nickname must be at least 3 characters long" })
    .max(30, { message: "Nickname must be at most 30 characters long" })
    .regex(
      /^[a-zA-Z0-9_.]+$/,
      "Nickname can only contain letters, numbers, underscores, and dots",
    ),
});

export type UpdateNicknameInput = z.infer<typeof updateNicknameSchema>;
