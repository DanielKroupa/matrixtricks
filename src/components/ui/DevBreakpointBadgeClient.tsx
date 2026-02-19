"use client";

import { useEffect, useState } from "react";
import DevBreakpointBadge from "./DevBreakpointBadge";

export default function DevBreakpointBadgeClient() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (process.env.NODE_ENV === "production" || !mounted) {
    return null;
  }

  return <DevBreakpointBadge />;
}
