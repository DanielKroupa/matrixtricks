"use client";

import Link from "next/link";

import { useState } from "react";

import type { ForgotPasswordFormData } from "@/app/helpers/forgot-password-schema";
import { forgotPasswordSchema } from "@/app/helpers/forgot-password-schema";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<
    Partial<Record<keyof ForgotPasswordFormData, string>>
  >({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsSubmitted(false);

    const result = forgotPasswordSchema.safeParse({ email });
    if (!result.success) {
      const validationErrors: Partial<
        Record<keyof ForgotPasswordFormData, string>
      > = {};
      result.error.issues.forEach((err) => {
        const field = err.path[0] as keyof ForgotPasswordFormData;
        validationErrors[field] = err.message;
      });
      setErrors(validationErrors);
      return;
    }

    console.log("Forgot Password:", result.data);
    setIsSubmitted(true);
    setEmail("");
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="text-center">
        <h2 className="text-2xl font-medium text-gray-900 dark:text-white">
          Reset Password
        </h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Enter your registered email to receive a reset link
        </p>
      </div>

      {/* Reset Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email Input */}
        <div>
          <input
            type="email"
            value={email}
            required
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email address"
            className={`mt-2 w-full rounded-lg dark:bg-neutral-700 bg-neutral-300 px-4 py-2.5 dark:text-neutral-300 text-neutral-700  placeholder-neutral-500 transition-colors outline-none dark:shadow-md ${
              errors.email ? "border border-red-500" : ""
            }`}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-500">{errors.email}</p>
          )}
        </div>

        {/* Send Reset Link Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-cyan-800 py-2 font-semibold text-white transition-colors hover:bg-cyan-900  cursor-pointer"
        >
          Send Reset Link
        </button>
      </form>

      {/* Info Box */}
      <div className="rounded-lg p-4 bg-neutral-300/50 dark:bg-neutral-600/20">
        <p className="text-sm dark:text-neutral-300 text-neutral-600 ">
          We'll send you an email with instructions to reset your password.
        </p>
      </div>

      {/* Footer Links */}
      <div className="space-y-2 border-t border-gray-200 pt-4 dark:border-gray-700">
        <Link
          href="/sign-in"
          className="block text-center mx-auto text-sm dark:text-cyan-500 dark:hover:text-cyan-700 text-cyan-700 hover:text-cyan-800 cursor-pointer "
        >
          Back to Sign In
        </Link>
        <Link
          href="sign-up"
          className="block w-full text-center text-sm text-gray-600 dark:text-gray-400"
        >
          Don't have an account?{" "}
          <span className="font-semibold text-cyan-600 transition-colors hover:text-cyan-700 cursor-pointer ">
            Sign up
          </span>
        </Link>
      </div>
    </div>
  );
}
