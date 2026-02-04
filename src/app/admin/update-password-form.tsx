"use client";

import { useState } from "react";
import {
  updatePasswordSchema,
  UpdatePasswordData,
} from "../helpers/update-password-schema";
import { useRouter } from "next/navigation";

import { Spinner } from "@/components/ui/spinner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { authClient } from "@/lib/auth-client";

export default function UpdatePasswordForm() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const router = useRouter();

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
    setSuccess(null);
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
        setSuccess("Password updated successfully");
        form.reset();
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      className="md:ml-10 ml-0 w-full self-end"
      onSubmit={handleSubmit(onSubmit)}
    >
      {/* Input change password */}
      <div className="flex gap-2 border-b-2 border-l-2 rounded-br-md rounded-bl-md border-r-2 border-neutral-300 dark:border-neutral-600">
        <div className="w-full ">
          <h3 className="text-lg dark:bg-neutral-600 bg-neutral-300 p-1 text-center">
            Change sign in password:
          </h3>
          <div className="space-y-4 p-4">
            <div className="flex flex-col gap-1">
              <label>Current password</label>
              <input
                type="password"
                autoComplete="current-password"
                className="dark:bg-neutral-700 bg-neutral-300 rounded px-2 py-1.5 md:w-72 w-full  outline-none"
                {...register("currentPassword")}
              />
              {errors.currentPassword && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.currentPassword.message}
                </p>
              )}
            </div>
            <div className="flex flex-col gap-1">
              <label>New password</label>
              <input
                type="password"
                autoComplete="new-password"
                className="dark:bg-neutral-700 bg-neutral-300 rounded px-2 py-1.5 md:w-72 w-full  outline-none"
                {...register("newPassword")}
              />
              {errors.newPassword && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.newPassword.message}
                </p>
              )}
            </div>
            <div className="flex flex-col gap-1">
              <label>Confirm new password</label>
              <input
                type="password"
                autoComplete="new-password"
                className="dark:bg-neutral-700 bg-neutral-300 rounded px-2 py-1.5 md:w-72 w-full  outline-none"
                {...register("confirmNewPassword")}
              />
              {errors.confirmNewPassword && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.confirmNewPassword.message}
                </p>
              )}
            </div>
            {error && (
              <p className="text-red-500 text-sm font-medium mt-1">{error}</p>
            )}
            <button
              type="submit"
              className={`dark:bg-cyan-900 bg-cyan-800 text-white py-2 px-3 rounded mr-2 md:w-fit w-full cursor-pointer shadow-md flex justify-center items-center gap-2 
                ${loading ? "opacity-50 cursor-not-allowed" : "opacity-100 cursor-pointer"}`}
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Spinner className="size-5" />
                  <span>Updating...</span>
                </span>
              ) : (
                "Save changes"
              )}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
