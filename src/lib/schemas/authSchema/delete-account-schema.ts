import { z } from "zod";

export const deleteAccountSchema = z
  .object({
    currentPassword: z.string().trim().min(1).optional(),
    confirmationText: z.string().trim().min(1).optional(),
  })
  .refine(
    (value) =>
      Boolean(value.currentPassword) || Boolean(value.confirmationText),
    {
      message: "Either currentPassword or confirmationText is required",
      path: ["currentPassword"],
    },
  );

export type DeleteAccountInput = z.infer<typeof deleteAccountSchema>;
