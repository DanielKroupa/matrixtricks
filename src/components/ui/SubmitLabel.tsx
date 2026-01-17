"use client";

import React from "react";
import { Spinner } from "@/components/ui/spinner";

type Props = {
  loading?: boolean;
  loadingText?: string;
  children?: React.ReactNode;
};

export default function SubmitLabel({
  loading,
  loadingText = "Signing in...",
  children,
}: Props) {
  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2">
        <Spinner className="size-6" />
        <p>{loadingText}</p>
      </div>
    );
  }

  return <>{children}</>;
}
