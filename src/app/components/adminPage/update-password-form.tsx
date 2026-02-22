"use client";

import { useState } from "react";
import Link from "next/link";
import {
  updatePasswordSchema,
  UpdatePasswordData,
} from "../../helpers/update-password-schema";

import { Spinner } from "@/app/components/ui/spinner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { authClient } from "@/lib/auth-client";

type UpdatePasswordFormProps = {
  canChangePassword: boolean;
};

export default function UpdatePasswordForm({
  canChangePassword,
}: UpdatePasswordFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const form = useForm<UpdatePasswordData>({
    resolver: zodResolver(updatePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = form;

  async function onSubmit({
    currentPassword,
    newPassword,
  }: UpdatePasswordData) {
    if (!canChangePassword) {
      setError("This account currently has no local password credential.");
      return;
    }

    setSuccess(false);
    setError(null);
    setLoading(true);

    try {
      const { error } = await authClient.changePassword({
        currentPassword,
        newPassword,
        revokeOtherSessions: true,
      });

      if (error) {
        setError(error.message || "Failed to update password");
      } else {
        setSuccess(true);
        form.reset();
        setStatus("Password updated successfully.");
      }
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }

  if (!canChangePassword) {
    return (
      <section className="ml-0 w-full self-end md:ml-10">
        <div className="flex w-fit gap-2 rounded-br-md rounded-bl-md border-r-2 border-b-2 border-l-2 border-neutral-300 dark:border-neutral-600">
          <div className="w-full">
            <h3 className="bg-neutral-300 p-1 text-center text-lg dark:bg-neutral-600">
              Change sign in password:
            </h3>
            <div className="space-y-3 p-4 px-6">
              <p className="text-sm text-neutral-700 dark:text-neutral-300">
                This account uses social sign in and has no local password yet.
              </p>
              <Link
                href="/forgot-password"
                className="inline-flex w-fit rounded bg-cyan-800 px-3 py-2 text-sm text-white shadow-md dark:bg-cyan-900"
              >
                Set password via email
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <form
      className="ml-0 w-full self-end md:ml-10"
      onSubmit={handleSubmit(onSubmit)}
    >
      {/* Input change password */}
      <div className="flex w-full gap-2 rounded-br-md rounded-bl-md border-r-2 border-b-2 border-l-2 border-neutral-300 md:w-fit dark:border-neutral-600">
        <div className="w-full">
          <h3 className="bg-neutral-300 p-1 text-center text-lg dark:bg-neutral-600">
            Change sign in password:
          </h3>

          <div className="space-y-4 p-4 px-6">
            {/* Current Password Input */}
            <div className="flex flex-col justify-center gap-1">
              <label>Current password</label>
              <input
                type="password"
                autoComplete="current-password"
                className="w-full rounded bg-neutral-300 px-2 py-1.5 ring-neutral-400 outline-none focus:ring-2 md:w-72 dark:bg-neutral-700 dark:ring-neutral-600"
                {...register("currentPassword")}
              />
              {errors.currentPassword && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.currentPassword.message}
                </p>
              )}
            </div>

            {/* New Password Input */}
            <div className="flex flex-col gap-1">
              <label>New password</label>
              <input
                type="password"
                autoComplete="new-password"
                className="w-full rounded bg-neutral-300 px-2 py-1.5 ring-neutral-400 outline-none focus:ring-2 md:w-72 dark:bg-neutral-700 dark:ring-neutral-600 dark:focus:ring-2"
                {...register("newPassword")}
              />
              {errors.newPassword && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.newPassword.message}
                </p>
              )}
            </div>

            {/* Confirm New Password Input */}
            <div className="flex flex-col gap-1">
              <label>Confirm new password</label>
              <input
                type="password"
                autoComplete="new-password"
                className="w-full rounded bg-neutral-300 px-2 py-1.5 ring-neutral-400 outline-none focus:ring-2 md:w-72 dark:bg-neutral-700 dark:ring-neutral-600 dark:focus:ring-2"
                {...register("confirmNewPassword")}
              />
              {errors.confirmNewPassword && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.confirmNewPassword.message}
                </p>
              )}
            </div>
            {error && (
              <p className="mt-1 text-sm font-medium text-red-500">{error}</p>
            )}
            {success && (
              <p className="mt-1 text-sm font-medium text-green-500">
                Password updated successfully.
              </p>
            )}
            <button
              type="submit"
              className={`mr-2 flex w-full items-center justify-center gap-2 rounded bg-cyan-800 px-3 py-2 text-white shadow-md md:w-fit dark:bg-cyan-900 ${
                loading
                  ? "cursor-not-allowed opacity-50"
                  : "cursor-pointer opacity-100"
              } `}
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Spinner className="size-5" />
                  <span>Updating...</span>
                </span>
              ) : (
                "Update password"
              )}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
