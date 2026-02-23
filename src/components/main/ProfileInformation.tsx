import { X } from "lucide-react";
import Image from "next/image";

import { User } from "@/lib/auth";

interface ProfileInformationProps {
  user: User;
}

export default function ProfileInformation({ user }: ProfileInformationProps) {
  return (
    <div className="fixed inset-0 z-50 flex shadow items-center justify-center bg-black/60 ">
      <div className="relative w-full max-w-md rounded-lg bg-white shadow-2xl dark:bg-neutral-800">
        <button
          className="absolute rounded-full bg-neutral-300 dark:bg-neutral-700 dark:shadow-md p-1.5 right-4 top-4 text-gray-500 transition-colors hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300 cursor-pointer"
          aria-label="Close modal"
          title="Close"
        >
          <X size={28} />
        </button>
        <div className="p-8 pt-12">
          <div className="w-full flex flex-col justify-center items-center gap-2">
            <Image
              src="/uploads/avatars/alien.png"
              alt="profile-avatar"
              className="w-28 h-28  object-contain"
              width={100}
              height={100}
            />
            <h2 className="text-center text- font-medium">Alien</h2>
          </div>
          <div className="space-y-8 ">
            <div className="flex flex-col gap-2">
              <p>Comments: 999</p>
              <p>Comments: 999</p>
              <p>Comments: 999</p>
            </div>
            <div className="flex flex-col">
              <p>Comments: 999</p>
              <p>Comments: 999</p>
              <p>Comments: 999</p>
            </div>
            <div className="flex flex-col">
              <p>Registered: 20.7.2025</p>
              <p>Last comment: 20.7.2025</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
