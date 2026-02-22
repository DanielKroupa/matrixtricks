"use client";

import { Spinner } from "@/app/components/ui/spinner";
import AvatarUpload from "@/app/admin/AvatarUpload";
import type { User } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useState } from "react";

type SettingsAvatarFormProps = {
  user: User;
};

export default function SettingsAvatarForm({ user }: SettingsAvatarFormProps) {
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
        setError(result?.error || "Avatar upload failed");
        return;
      }

      setAvatarFile(null);
      setSuccess("Avatar updated successfully");
      router.refresh();
    } catch (uploadError: unknown) {
      const message =
        uploadError instanceof Error
          ? uploadError.message
          : "An unexpected error occurred";
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
          className={`cursor pointer mt-2 mr-2 mb-4 flex w-full cursor-pointer items-center justify-center gap-2 rounded bg-cyan-800 px-3 py-2 text-white shadow-md transition-all hover:bg-cyan-900 md:mb-0 md:w-fit dark:bg-cyan-900 ${saving ? "cursor-not-allowed opacity-50" : "opacity-100"}`}
        >
          {saving ? (
            <span className="flex items-center gap-2">
              <Spinner className="size-5" />
              <span>Saving...</span>
            </span>
          ) : (
            "Save"
          )}
        </button>
      )}

      {success && <p className="mt-1 text-sm font-medium text-green-500">{success}</p>}
      {error && <p className="mt-1 text-sm font-medium text-red-500">{error}</p>}
    </form>
  );
}