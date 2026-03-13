"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import AvatarUpload from "@/app/admin/AvatarUpload";
import { Spinner } from "@/components/ui/spinner";
import type { User } from "@/lib/auth";
import { useI18n } from "@/lib/i18n/client";

type SettingsAvatarFormProps = {
  user: User;
};

export default function SettingsAvatarForm({ user }: SettingsAvatarFormProps) {
  const { dictionary } = useI18n();
  const { auth } = dictionary;
  const router = useRouter();
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!avatarFile) {
      return;
    }

    setError(null);
    setSuccess(null);
    setSaving(true);

    try {
      const formData = new FormData();
      formData.append("file", avatarFile);

      const response = await fetch("/api/users/me/avatar", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result?.error || auth.avatarUploadFailed);
        return;
      }

      setAvatarFile(null);
      setSuccess(auth.avatarUpdated);
      router.refresh();
    } catch (uploadError: unknown) {
      const message =
        uploadError instanceof Error
          ? uploadError.message
          : auth.unexpectedError;
      setError(message);
    } finally {
      setSaving(false);
    }
  }

  function handleImageChange(imageFile: File | null) {
    setAvatarFile(imageFile);
    setError(null);
    setSuccess(null);
  }

  return (
    <form onSubmit={onSubmit} encType="multipart/form-data">
      <AvatarUpload user={user} onImageChange={handleImageChange} />

      {avatarFile && (
        <button
          type="submit"
          disabled={saving}
          className={`mt-2 mr-2 mb-4 flex w-full items-center justify-center gap-2 rounded bg-cyan-800 px-3 py-2 text-white shadow-md transition-all hover:bg-cyan-900 md:mb-0 md:w-fit dark:bg-cyan-900 ${saving ? "cursor-not-allowed opacity-50" : "opacity-100"}`}
        >
          {saving ? (
            <span className="flex items-center gap-2">
              <Spinner className="size-5" />
              <span>{auth.saving}</span>
            </span>
          ) : (
            auth.saveAvatar
          )}
        </button>
      )}

      {success && (
        <p className="mt-1 text-sm font-medium text-green-500">{success}</p>
      )}
      {error && (
        <p className="mt-1 text-sm font-medium text-red-500">{error}</p>
      )}
    </form>
  );
}
