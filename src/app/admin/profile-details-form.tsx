"use client";

import {
  updateProfileSchema,
  UpdateProfileFormData,
} from "../helpers/update-profile-schema";
import { User } from "@/lib/auth";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { authClient } from "@/lib/auth-client";

import { useRouter } from "next/navigation";
import AvatarUpload from "./AvatarUpload";
import AutoResizeTextarea from "../components/ui/form/AutoResizeTextarea";

interface ProfileDetailsFormProps {
  user: User;
}

export function ProfileDetailsForm({ user }: ProfileDetailsFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const form = useForm<UpdateProfileFormData>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      nickname: user.name ?? "",
      image: user.image ?? null,
    },
  });

  async function onSubmit({ nickname, image }: UpdateProfileFormData) {
    setSuccess(null);
    setError(null);
    setLoading(true);
    try {
      const { error } = await authClient.updateUser({ name: nickname });

      if (error) {
        setError(error.message || "Failed to update profile");
      } else {
        setSuccess("Profile updated successfully");
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        form.setValue("image", base64, { shouldDirty: true });
      };
      reader.readAsDataURL(file);
    }
  }

  return (
    <form
      className="pb-4"
      onSubmit={form.handleSubmit(onSubmit)}
      encType="multipart/form-data"
    >
      <AvatarUpload user={user} />

      {/* Input change nickname */}
      <div className="md:w-72 w-auto space-y-4 ">
        <div className="flex flex-col gap-2">
          <label>Nickname:</label>
          <input
            type="text"
            placeholder={user.name || "Enter nickname"}
            className="dark:bg-neutral-700 bg-neutral-300 rounded px-2 py-1.5 md:w-72 w-auto outline-none"
            {...form.register("nickname")}
          />
          {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
          {success && <p className="text-green-500 text-sm mt-1">{success}</p>}
        </div>
        {/* Input change bio information */}
        <div className="flex flex-col gap-2 ">
          <label>Change bio information:</label>
          <AutoResizeTextarea />
          <button
            type="submit"
            disabled={loading}
            className={`dark:bg-cyan-900 w-full bg-cyan-800 mt-2 md:mb-0 mb-4 text-white py-2 px-3 rounded mr-2 md:w-fit cursor-pointer shadow-md flex justify-center items-center gap-2 
                ${loading ? "cursor-not-allowed opacity-50" : "cursor pointer opacity-100"}`}
          >
            {loading ? "Updating..." : "Save changes"}
          </button>
        </div>
      </div>
    </form>
  );
}
