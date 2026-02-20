"use client";

import { useState, useTransition } from "react";
import { saveOnlineVisibilityPreferenceAction } from "@/actions/online-visibility";
import { usePresence } from "@/context/PresenceContext";

type OnlineVisibilityToggleProps = {
  initialEnabled: boolean;
};

export function OnlineVisibilityToggle({
  initialEnabled,
}: OnlineVisibilityToggleProps) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const { isSelfOnline, setVisibilityEnabled } = usePresence();

  const toggle = () => {
    const nextValue = !enabled;
    setError(null);

    startTransition(async () => {
      const result = await saveOnlineVisibilityPreferenceAction({
        enabled: nextValue,
      });

      if ("error" in result && result.error) {
        setError(result.error);
        return;
      }

      setEnabled(nextValue);
      setVisibilityEnabled(nextValue);
    });
  };

  return (
    <div className="flex items-center gap-2">
      Online visibility:
      <button
        type="button"
        onClick={toggle}
        disabled={isPending}
        className="flex cursor-pointer items-center justify-center gap-1.5 rounded-md bg-neutral-300 px-2 py-1.5 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-neutral-600"
      >
        <span
          className={`flex size-3 rounded-full p-1 ${
            isSelfOnline
              ? "bg-green-500 shadow-md shadow-green-600/60"
              : "bg-amber-600"
          }`}
        ></span>
        {enabled ? " ON" : " OFF"}
      </button>
      {error ? <p className="text-sm text-red-500">{error}</p> : null}
    </div>
  );
}
