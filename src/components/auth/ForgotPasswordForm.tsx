"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useState } from "react";

import { useForm } from "react-hook-form";
import { Spinner } from "@/components/ui/spinner";
import { authClient } from "@/lib/auth-client";
import { useI18n } from "@/lib/i18n/client";
import {
  type ForgotPasswordFormData,
  forgotPasswordSchema,
} from "@/lib/schemas/authSchema/forgot-password-schema";

export default function ForgotPasswordForm() {
  const { dictionary, localizeHref } = useI18n();
  const { auth } = dictionary;
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = form;

  async function onSubmit({ email }: ForgotPasswordFormData) {
    setError("");
    setSuccess(false);
    setLoading(true);
    try {
      const result = await authClient.requestPasswordReset({
        email,
        redirectTo: localizeHref("/reset-password"),
      });

      if (result.error) {
        setError(result.error.message || auth.resetFailed);
      } else {
        setSuccess(true);
        console.log("Reset link sent successfully");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : auth.unexpectedError);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="text-center">
        <h2 className="text-2xl font-medium text-gray-900 dark:text-white">
          {auth.forgotTitle}
        </h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          {auth.forgotSubtitle}
        </p>
      </div>

      {/* Reset Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {success && (
          <p className="rounded-lg border-2 border-green-300 bg-green-100 p-3 text-green-600">
            {auth.resetSent}
          </p>
        )}
        {/* Email Input */}
        <div>
          <input
            type="email"
            {...register("email")}
            placeholder={auth.resetEmailPlaceholder}
            className={`mt-2 w-full rounded-lg bg-neutral-300 px-4 py-2.5 text-neutral-700 placeholder-neutral-500 transition-colors outline-none dark:bg-neutral-700 dark:text-neutral-300 dark:shadow-md ${
              errors.email ? "border border-red-500" : ""
            }`}
            required
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
          )}
          {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
        </div>

        {/* Send Reset Link Button */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full rounded-lg bg-cyan-800 py-2 font-semibold text-white transition-colors hover:bg-cyan-900 ${loading ? "cursor-not-allowed bg-cyan-900 opacity-50" : "cursor-pointer"}`}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <Spinner />
              {auth.sending}
            </span>
          ) : (
            auth.sendResetLink
          )}
        </button>
      </form>

      {/* Info Box */}
      <div className="rounded-lg bg-neutral-300/50 p-4 dark:bg-neutral-600/20">
        <p className="text-sm text-neutral-600 dark:text-neutral-300">
          {auth.forgotInfo}
        </p>
      </div>

      {/* Footer Links */}
      <div className="space-y-2 border-t border-gray-200 pt-4 dark:border-gray-700">
        <Link
          href={localizeHref("/sign-in")}
          className="mx-auto block cursor-pointer text-center text-sm text-cyan-700 hover:text-cyan-800 dark:text-cyan-500 dark:hover:text-cyan-700"
        >
          {auth.backToSignIn}
        </Link>
        <Link
          href={localizeHref("/sign-up")}
          className="block w-full text-center text-sm text-gray-600 dark:text-gray-400"
        >
          {auth.noAccount}{" "}
          <span className="cursor-pointer font-semibold text-cyan-600 transition-colors hover:text-cyan-700">
            {auth.signUp}
          </span>
        </Link>
      </div>
    </div>
  );
}
