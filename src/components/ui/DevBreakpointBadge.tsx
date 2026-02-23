"use client";

import { useEffect, useState } from "react";

const getBreakpointFromWidth = (w: number) => {
  if (w >= 1536) return "2xl";
  if (w >= 1280) return "xl";
  if (w >= 1024) return "lg";
  if (w >= 768) return "md";
  if (w >= 640) return "sm";
  return "xs";
};

export default function DevBreakpointBadge() {
  const [bp, setBp] = useState(() =>
    typeof window === "undefined"
      ? "xs"
      : getBreakpointFromWidth(window.innerWidth),
  );

  useEffect(() => {
    const handler = () => setBp(getBreakpointFromWidth(window.innerWidth));
    handler();
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  return (
    <div
      aria-live="polite"
      className="fixed bottom-4 left-16 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-black/80 font-mono text-sm text-white shadow-lg dark:bg-white/25"
    >
      <span aria-hidden>{bp}</span>
    </div>
  );
}
