"use client";

import { X } from "lucide-react";

import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";
import ForgotPasswordForm from "./ForgotPasswordForm";
import { useAuth } from "@/context/AuthContext";

export function LoginModal() {
  const { isModalOpen, closeModal, currentForm } = useAuth();

  if (!isModalOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      closeModal();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex shadow items-center justify-center bg-black/60 "
      onClick={handleBackdropClick}
    >
      <div className="relative w-full max-w-md rounded-lg bg-white shadow-2xl dark:bg-neutral-800">
        {/* Close Button */}
        <button
          onClick={closeModal}
          className="absolute rounded-full bg-neutral-300 dark:bg-neutral-700 dark:shadow-md p-1.5 right-4 top-4 text-gray-500 transition-colors hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300 cursor-pointer"
          aria-label="Close modal"
          title="Close"
        >
          <X size={28} />
        </button>

        {/* Content */}
        <div className="p-8 pt-12">
          {currentForm === "login" && <LoginForm />}
          {currentForm === "register" && <RegisterForm />}
          {currentForm === "forgot" && <ForgotPasswordForm />}
        </div>
      </div>
    </div>
  );
}
