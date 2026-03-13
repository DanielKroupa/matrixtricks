"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import PrimaryButton from "@/components/ui/form/PrimaryButton";
import { useAuth } from "@/hooks/AuthContext";
import { authClient } from "@/lib/auth-client";
import { useI18n } from "@/lib/i18n/client";
import {
  type RegisterFormData,
  registerSchema,
} from "@/lib/schemas/authSchema/register-schema";

export default function RegisterForm() {
  const { dictionary, localizeHref } = useI18n();
  const { auth } = dictionary;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const {
    register,
    handleSubmit,
    setError: setFormError,
    clearErrors,
    formState: { errors },
  } = form;

  const { closeModal } = useAuth();

  async function ensureNicknameIsAvailable(value: string) {
    const response = await fetch(
      `/api/users/username-availability?value=${encodeURIComponent(value)}`,
      {
        method: "GET",
        cache: "no-store",
      },
    );

    const payload = (await response.json()) as {
      available?: boolean;
      error?: string;
    };

    if (!response.ok || !payload.available) {
      return payload.error || auth.usernameTaken;
    }

    return null;
  }

  async function onSubmit({ email, password, username }: RegisterFormData) {
    setError(null);
    setLoading(true);
    try {
      const normalizedUsername = username.trim();
      const availabilityError =
        await ensureNicknameIsAvailable(normalizedUsername);

      if (availabilityError) {
        setFormError("username", {
          type: "manual",
          message: availabilityError,
        });
        return;
      }

      clearErrors("username");

      const result = await authClient.signUp.email({
        email,
        name: normalizedUsername,

        password,
        callbackURL: localizeHref("/"),
      });

      if (result.error) {
        setError(result.error.message || auth.signUpFailed);
      } else {
        // close modal (when used inside modal) and navigate home without router
        closeModal();
        // use full page navigation to ensure session state updates
        window.location.assign(localizeHref("/"));
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : auth.unexpectedError);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-medium text-gray-900 dark:text-white">
          {auth.signUpTitle}
        </h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          {auth.signUpSubtitle}
        </p>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        autoComplete="off"
        className="space-y-4"
      >
        <div>
          <input
            type="email"
            {...register("email")}
            autoComplete="email"
            placeholder={auth.emailPlaceholder}
            className={`mt-2 w-full rounded-lg bg-neutral-300 px-4 py-2.5 text-neutral-700 placeholder-neutral-500 transition-colors outline-none dark:bg-neutral-700 dark:text-neutral-300 dark:shadow-md ${
              errors.email ? "border border-red-500" : ""
            }`}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
          )}
        </div>

        <div>
          <input
            type="text"
            {...register("username")}
            autoComplete="username"
            placeholder={auth.usernamePlaceholder}
            className={`mt-2 w-full rounded-lg bg-neutral-300 px-4 py-2.5 text-neutral-700 placeholder-neutral-500 transition-colors outline-none dark:bg-neutral-700 dark:text-neutral-300 dark:shadow-md ${
              errors.username ? "border border-red-500" : ""
            }`}
          />
          {errors.username && (
            <p className="mt-1 text-sm text-red-500">
              {errors.username.message}
            </p>
          )}
        </div>

        <div>
          <input
            type="password"
            {...register("password")}
            autoComplete="new-password"
            placeholder={auth.passwordCreatePlaceholder}
            className={`mt-2 w-full rounded-lg bg-neutral-300 px-4 py-2.5 text-neutral-700 placeholder-neutral-500 transition-colors outline-none dark:bg-neutral-700 dark:text-neutral-300 dark:shadow-md ${
              errors.password ? "border border-red-500" : ""
            }`}
          />
          {errors.password && (
            <p className="mt-1 text-sm text-red-500">
              {errors.password.message}
            </p>
          )}
        </div>

        <div>
          <input
            type="password"
            {...register("confirmPassword")}
            autoComplete="new-password"
            placeholder={auth.passwordConfirmPlaceholder}
            className={`mt-2 w-full rounded-lg bg-neutral-300 px-4 py-2.5 text-neutral-700 placeholder-neutral-500 transition-colors outline-none dark:bg-neutral-700 dark:text-neutral-300 dark:shadow-md ${
              errors.confirmPassword ? "border border-red-500" : ""
            }`}
          />
          {errors.confirmPassword && (
            <p className="mt-1 text-sm text-red-500">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <PrimaryButton
          type="submit"
          loading={loading}
          loadingText={auth.signingUp}
        >
          {auth.signUp}
        </PrimaryButton>
      </form>

      <div className="border-t border-neutral-300 pt-4 dark:border-neutral-600">
        <p className="text-center text-sm text-gray-600 dark:text-gray-400">
          {auth.alreadyHaveAccount}{" "}
          <Link
            href={localizeHref("/sign-in")}
            className="cursor-pointer font-semibold text-cyan-600 transition-colors hover:text-cyan-700"
          >
            {auth.loginTitle}
          </Link>
        </p>
      </div>
    </div>
  );
}
