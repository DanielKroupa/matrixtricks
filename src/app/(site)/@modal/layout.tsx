"use client";

import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";

type ModalLayoutProps = {
  children: React.ReactNode;
};

export default function ModalLayout({ children }: ModalLayoutProps) {
  const router = useRouter();

  const handleClose = () => {
    router.back();
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  return (
    <div
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 shadow"
    >
      <div className="relative w-full max-w-md rounded-lg bg-white shadow-2xl dark:bg-neutral-800">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 cursor-pointer rounded-full bg-neutral-300 p-1.5 text-gray-500 transition-colors hover:text-gray-800 dark:bg-neutral-700 dark:text-gray-400 dark:shadow-md dark:hover:text-gray-300"
          aria-label="Close modal"
          title="Close"
        >
          <X size={28} />
        </button>

        {/* Content */}
        <div className="p-8 pt-12">{children}</div>
      </div>
    </div>
  );
}
