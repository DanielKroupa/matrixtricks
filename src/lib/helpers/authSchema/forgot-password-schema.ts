import { z } from "zod";

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .nonempty("Email is required")
    .min(1, "Email is required")
    .email("Please enter a valid email"),
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
