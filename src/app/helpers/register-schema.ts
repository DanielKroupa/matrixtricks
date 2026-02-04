import { z } from "zod";

export const registerSchema = z
  .object({
    email: z
      .string()
      .nonempty("Email is required")
      .min(1, "Email is required")
      .email({ error: "Please enter a valid email" }),
    username: z
      .string()
      .nonempty("Username is required")
      .min(1, "Username is required")
      .min(3, "Username must be at least 3 characters")
      .max(25, "Username must be at most 25 characters long")
      .regex(
        /^[a-zA-Z0-9_.]+$/,
        "Username can only contain letters, numbers, underscores, and dots",
      ),
    password: z
      .string()
      .nonempty("Password is required")
      .min(1, "Password is required")
      .min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Password confirmation is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;
