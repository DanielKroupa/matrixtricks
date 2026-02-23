"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { authClient } from "@/lib/auth-client";
import {
  type ResetPasswordData,
  resetPasswordSchema,
} from "@/lib/schemas/authSchema/reset-password-schema";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [_error, setError] = useState("");
  const [token, setToken] = useState<string | null>(null);

  const form = useForm<ResetPasswordData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = form;

  useEffect(() => {
    const tokenParam = searchParams.get("token");
    if (!tokenParam) {
      setError("Invalid or missing token");
    } else {
      setToken(tokenParam);
    }
  }, [searchParams]);

  async function onSubmit({ password }: ResetPasswordData) {
    if (!token) return;

    setError("");
    setSuccess(false);
    setLoading(true);
    try {
      const { error } = await authClient.resetPassword({
        newPassword: password,
        token,
      });

      if (error) {
        setError(error.message || "Failed to reset password");
      } else {
        setSuccess(true);
        form.reset();
        setTimeout(() => router.push("/"), 3000);
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Something went wrong during resetting password";
      setError(message);
      console.error("Reset password error:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 shadow">
      <div className="relative w-full max-w-md rounded-lg bg-white shadow-xl dark:bg-neutral-800">
        <div className="p-8 pt-12">
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-medium text-gray-900 dark:text-white">
                Reset Password
              </h2>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Enter your new password below
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <input
                  type="password"
                  autoComplete="new-password"
                  {...register("password")}
                  placeholder="New Password"
                  className={`mt-2 w-full rounded-lg bg-neutral-300 px-4 py-2.5 text-neutral-700 placeholder-neutral-500 transition-colors outline-none dark:bg-neutral-700 dark:text-neutral-300 dark:shadow-md ${errors.password ? "border border-red-500" : ""}`}
                  required
                />
              </div>
              <div>
                <input
                  type="password"
                  autoComplete="new-password"
                  {...register("confirmPassword")}
                  placeholder="Confirm new password"
                  className={`mt-2 w-full rounded-lg bg-neutral-300 px-4 py-2.5 text-neutral-700 placeholder-neutral-500 transition-colors outline-none dark:bg-neutral-700 dark:text-neutral-300 dark:shadow-md ${errors.confirmPassword ? "border border-red-500" : ""}`}
                  required
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || !token}
                className="w-full rounded-lg bg-cyan-800 py-2 font-semibold text-white transition-colors hover:bg-cyan-900"
              >
                {success
                  ? "Password Reset!"
                  : loading
                    ? "Submitting..."
                    : "Submit new password"}
              </button>
            </form>

            <div className="space-y-2 border-t border-gray-200 pt-4 dark:border-gray-700">
              <Link
                href="/sign-in"
                className="mx-auto block cursor-pointer text-center text-sm text-cyan-700 hover:text-cyan-800 dark:text-cyan-500 dark:hover:text-cyan-700"
              >
                Back to Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}
