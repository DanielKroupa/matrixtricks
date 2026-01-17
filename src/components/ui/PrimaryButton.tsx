"use client";

import React from "react";
import SubmitLabel from "@/components/ui/SubmitLabel";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  loading?: boolean;
  loadingText?: string;
};

export default function PrimaryButton({
  loading,
  loadingText = "Signing in...",
  children,
  className = "",
  disabled,
  type = "button",
  ...rest
}: Props) {
  const isDisabled = Boolean(disabled || loading);

  return (
    <button
      type={type}
      disabled={isDisabled}
      className={`w-full rounded-lg bg-cyan-800 py-2.5 font-semibold text-white shadow-md transition-colors hover:bg-cyan-900 ${
        isDisabled
          ? "opacity-50 cursor-not-allowed bg-cyan-900"
          : "cursor-pointer"
      } ${className}`}
      {...rest}
    >
      <SubmitLabel loading={loading} loadingText={loadingText}>
        {children}
      </SubmitLabel>
    </button>
  );
}
