"use client";

import { X } from "lucide-react";
import Image from "next/image";

import type { User } from "@/lib/auth";
import { useI18n } from "@/lib/i18n/client";

interface ProfileInformationProps {
  user: User;
}

export default function ProfileInformation({ user }: ProfileInformationProps) {
  const { dictionary } = useI18n();
  const { main } = dictionary;
  const displayName = user.name || user.username || main.profileFallbackName;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 shadow">
      <div className="relative w-full max-w-md rounded-lg bg-white shadow-xl dark:bg-neutral-800">
        <button
          type="button"
          className="absolute top-4 right-4 cursor-pointer rounded-full bg-neutral-300 p-1.5 text-gray-500 transition-colors hover:text-gray-800 dark:bg-neutral-700 dark:text-gray-400 dark:shadow-md dark:hover:text-gray-300"
          aria-label={main.profileCloseModal}
          title={main.profileClose}
        >
          <X size={28} />
        </button>
        <div className="p-8 pt-12">
          <div className="flex w-full flex-col items-center justify-center gap-2">
            <Image
              src="/uploads/avatars/alien.png"
              alt={main.profileAvatarAlt}
              className="h-28 w-28 object-contain"
              width={100}
              height={100}
            />
            <h2 className="text-center font-medium">{displayName}</h2>
          </div>
          <div className="space-y-8">
            <div className="flex flex-col gap-2">
              <p>{main.profileComments}: 999</p>
              <p>{main.profileShares}: 999</p>
              <p>{main.profileLikes}: 999</p>
            </div>
            <div className="flex flex-col">
              <p>{main.profileFans}: 999</p>
              <p>{main.profileComments}: 999</p>
              <p>{main.profileLikes}: 999</p>
            </div>
            <div className="flex flex-col">
              <p>{main.profileRegistered}: 20.7.2025</p>
              <p>{main.profileLastComment}: 20.7.2025</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
