"use client";

import { createPortal } from "react-dom";
import type { BlockScopes, BlockUserDialogProps } from "@/types/social";

const scopeOptions: Array<[keyof BlockScopes, string]> = [
  ["commentCreate", "Comment create"],
  ["commentUpdate", "Comment edit"],
  ["commentDelete", "Comment delete"],
  ["fanwallCreate", "Fanwall create"],
  ["fanwallUpdate", "Fanwall edit"],
  ["fanwallDelete", "Fanwall delete"],
];

export function BlockUserDialog({
  isOpen,
  blockReason,
  onBlockReasonChange,
  blockType,
  onBlockTypeChange,
  blockUntil,
  onBlockUntilChange,
  blockScopes,
  onBlockScopeChange,
  blockLoading,
  onClose,
  onConfirm,
}: BlockUserDialogProps) {
  if (!isOpen || typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div className="fixed inset-0 z-90 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-lg border border-neutral-300 bg-neutral-100 p-4 shadow-xl dark:border-neutral-600 dark:bg-neutral-800">
        <h3 className="text-base font-semibold">Block user</h3>
        <p className="mt-1 text-xs text-neutral-600 dark:text-neutral-300">
          This will prevent writing comments and fanwall messages. Anonymous
          restrictions can affect users sharing the same IP/device.
        </p>

        <div className="mt-3 space-y-3">
          <textarea
            value={blockReason}
            onChange={(event) => onBlockReasonChange(event.target.value)}
            placeholder="Reason (required)"
            className="w-full resize-none rounded-md border border-neutral-300 bg-white p-2 text-sm outline-none focus:border-cyan-600 dark:border-neutral-600 dark:bg-neutral-700"
            rows={3}
          />

          <div className="flex items-center gap-3 text-sm">
            <label className="flex items-center gap-1">
              <input
                type="radio"
                checked={blockType === "permanent"}
                onChange={() => onBlockTypeChange("permanent")}
              />
              Permanent
            </label>
            <label className="flex items-center gap-1">
              <input
                type="radio"
                checked={blockType === "temporary"}
                onChange={() => onBlockTypeChange("temporary")}
              />
              Temporary
            </label>
          </div>

          {blockType === "temporary" ? (
            <input
              type="datetime-local"
              value={blockUntil}
              onChange={(event) => onBlockUntilChange(event.target.value)}
              className="w-full rounded-md border border-neutral-300 bg-white p-2 text-sm outline-none focus:border-cyan-600 dark:border-neutral-600 dark:bg-neutral-700"
            />
          ) : null}

          <div className="grid grid-cols-2 gap-2 text-xs">
            {scopeOptions.map(([key, label]) => (
              <label key={key} className="flex items-center gap-1">
                <input
                  type="checkbox"
                  checked={blockScopes[key]}
                  onChange={(event) =>
                    onBlockScopeChange(key, event.target.checked)
                  }
                />
                {label}
              </label>
            ))}
          </div>
        </div>

        <div className="mt-4 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-md border border-neutral-400 px-3 py-2 text-sm"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={blockLoading}
            className="cursor-pointer rounded-md bg-red-700 px-3 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {blockLoading ? "Blocking…" : "Confirm Block"}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
export type { BlockScopes };
