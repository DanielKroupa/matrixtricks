import { z } from "zod";

export const updatePasswordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(8, {
        message: "Current password must be at least 8 characters long",
      })
      .nonempty({ message: "Current password is required" }),
    newPassword: z
      .string()
      .min(8, { message: "New password must be at least 8 characters long" })
      .nonempty({ message: "New password is required" }),
    confirmNewPassword: z
      .string()
      .min(8, {
        message: "Confirm new password must be at least 8 characters long",
      })
      .nonempty({ message: "Confirm new password is required" }),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "New passwords do not match",
    path: ["confirmNewPassword"],
  });

export type UpdatePasswordData = z.infer<typeof updatePasswordSchema>;
