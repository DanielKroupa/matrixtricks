"use client";

import { X } from "lucide-react";
import { useAuth } from "@/hooks/AuthContext";
import { useI18n } from "@/lib/i18n/client";
import ForgotPasswordForm from "./ForgotPasswordForm";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";

export function LoginModal() {
  const { dictionary } = useI18n();
  const { auth } = dictionary;
  const { isModalOpen, closeModal, currentForm } = useAuth();

  if (!isModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 shadow">
      <button
        type="button"
        onClick={closeModal}
        aria-label={auth.closeModalOverlay}
        className="absolute inset-0"
      />
      <div className="relative w-full max-w-md rounded-lg bg-white shadow-xl dark:bg-neutral-800">
        {/* Close Button */}
        <button
          type="button"
          onClick={closeModal}
          className="absolute top-4 right-4 cursor-pointer rounded-full bg-neutral-300 p-1.5 text-gray-500 transition-colors hover:text-gray-800 dark:bg-neutral-700 dark:text-gray-400 dark:shadow-md dark:hover:text-gray-300"
          aria-label={auth.closeModal}
          title={auth.closeText}
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
