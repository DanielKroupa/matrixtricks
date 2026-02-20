import { z } from "zod";

export const loginSchema = z.object({
  login: z
    .string()
    .nonempty("Email or username is required")
    .min(1, "Email or username is required"),
  password: z
    .string()
    .nonempty("Password is required")
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters"),
  rememberMe: z.boolean().optional(),
});

export type LoginFormData = z.infer<typeof loginSchema>;
