"use client";

import {
  updateProfileSchema,
  type UpdateProfileFormData,
} from "../../helpers/update-profile-schema";
import type { User } from "@/lib/auth";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { authClient } from "@/lib/auth-client";
import { updateSiteSettings } from "@/actions/site-settings";

import { useRouter } from "next/navigation";
import AvatarUpload from "../../admin/AvatarUpload";
import AutoResizeTextarea from "../ui/form/AutoResizeTextarea";

import { Spinner } from "@/components/ui/spinner";

interface ProfileDetailsFormProps {
  user: User;
  initialTitle: string;
  initialBio: string;
}

export function ProfileDetailsForm({
  user,
  initialTitle,
  initialBio,
}: ProfileDetailsFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const router = useRouter();

  const form = useForm<UpdateProfileFormData>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      nickname: user.name ?? "",
      title: initialTitle,
      bio: initialBio,
    },
  });

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = form;

  async function onSubmit({ nickname, title, bio }: UpdateProfileFormData) {
    setSuccess(null);
    setError(null);
    setLoading(true);

    try {
      const { error: updateNameError } = await authClient.updateUser({
        name: nickname,
      });

      if (updateNameError) {
        setError(updateNameError.message || "Failed to update profile");
        return;
      }

      if (avatarFile) {
        const formData = new FormData();
        formData.append("file", avatarFile);

        const response = await fetch("/api/users/me/avatar", {
          method: "POST",
          body: formData,
        });

        const result = await response.json();

        if (!response.ok) {
          setError(
            result?.error || "Profile name updated, avatar upload failed",
          );
          return;
        }

        setAvatarFile(null);
      }

      const siteSettingsResult = await updateSiteSettings({
        title,
        bio,
      });

      if (siteSettingsResult?.error) {
        setError(siteSettingsResult.error);
        return;
      }

      setSuccess("Profile updated successfully");
      router.refresh();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "An unexpected error occurred";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  function handleImageChange(imageFile: File | null) {
    setAvatarFile(imageFile);
  }

  return (
    <form
      className="pb-4"
      onSubmit={handleSubmit(onSubmit)}
      encType="multipart/form-data"
    >
      <AvatarUpload user={user} onImageChange={handleImageChange} />

      {/* Input change nickname */}
      <div className="w-auto space-y-4 md:w-72">
        <div className="flex flex-col gap-2">
          <label>Nickname:</label>
          <input
            type="text"
            placeholder={user.name || "Enter nickname"}
            className="w-auto rounded bg-neutral-300 px-2 py-1.5 outline-none md:w-72 dark:bg-neutral-700"
            {...register("nickname")}
          />
          {errors.nickname && (
            <p className="mt-1 text-sm font-medium text-red-500">
              {errors.nickname.message}
            </p>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <label>Edit main title:</label>
          <input
            type="text"
            placeholder={initialTitle || "Enter main title"}
            className="w-auto rounded bg-neutral-300 px-2 py-1.5 outline-none md:w-72 dark:bg-neutral-700"
            {...register("title")}
          />
          {errors.title && (
            <p className="mt-1 text-sm font-medium text-red-500">
              {errors.title.message}
            </p>
          )}
        </div>
        {/* Input change bio information */}
        <div className="flex flex-col gap-2">
          <label>Change bio information:</label>
          <Controller
            name="bio"
            control={control}
            render={({ field }) => (
              <AutoResizeTextarea
                value={field.value}
                onChange={field.onChange}
                placeholder={initialBio || "Enter bio"}
              />
            )}
          />
          {errors.bio && (
            <p className="mt-1 text-sm font-medium text-red-500">
              {errors.bio.message}
            </p>
          )}
        </div>
        {success && (
          <p className="mt-1 text-sm font-medium text-green-500">{success}</p>
        )}
        <button
          type="submit"
          disabled={loading}
          className={`cursor pointer mt-2 mr-2 mb-4 flex w-full cursor-pointer items-center justify-center gap-2 rounded bg-cyan-800 px-3 py-2 text-white shadow-md transition-all hover:bg-cyan-900 md:mb-0 md:w-fit dark:bg-cyan-900 ${loading ? "cursor-not-allowed opacity-50" : "opacity-100"}`}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <Spinner className="size-5" />
              <span>Saving...</span>
            </span>
          ) : (
            "Save changes"
          )}
        </button>
        {error && (
          <p className="mt-1 text-sm font-medium text-red-500">{error}</p>
        )}
      </div>
    </form>
  );
}
