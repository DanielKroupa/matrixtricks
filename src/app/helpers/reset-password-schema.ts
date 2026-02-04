import { z } from "zod";

export const resetPasswordSchema = z
  .object({
    password: z
      .string() // check if it is a string type
      .min(1, { message: "Password is required" }) // checks if the password is provided
      .min(8, { message: "Password must be at least 8 characters long" }) // checks for character length
      .max(20, { message: "Password must be at most 20 characters long" })
      .nonempty({ message: "Password is required" }),

    confirmPassword: z
      .string()
      .min(1, { message: "Confirm Password is required" })
      .min(8, { message: "Password must be at least 8 characters long" })
      .max(20, { message: "Password must be at most 20 characters long" })
      .nonempty({ message: "Confirm Password is required" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],

    // checks if the password and confirm password are equal
  });

export type ResetPasswordData = z.infer<typeof resetPasswordSchema>;
