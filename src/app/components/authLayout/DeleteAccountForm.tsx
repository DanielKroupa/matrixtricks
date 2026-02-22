"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Spinner } from "@/app/components/ui/spinner";

type DeleteAccountFormProps = {
  canChangePassword: boolean;
};

export default function DeleteAccountForm({
  canChangePassword,
}: DeleteAccountFormProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [step, setStep] = useState<"confirm" | "password">("confirm");
  const [currentPassword, setCurrentPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function openModal() {
    setError(null);
    setCurrentPassword("");
    setStep("confirm");
    setIsModalOpen(true);
  }

  function closeModal() {
    if (loading) {
      return;
    }

    setIsModalOpen(false);
    setError(null);
    setCurrentPassword("");
    setStep("confirm");
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!canChangePassword) {
      setError(
        "Account deletion is available only for accounts with password.",
      );
      return;
    }

    if (!currentPassword.trim()) {
      setError("Current password is required.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/users/me/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ currentPassword }),
      });

      const data = (await response.json().catch(() => null)) as {
        error?: string;
        deleteAfterAt?: string;
      } | null;

      if (!response.ok) {
        setError(data?.error ?? "Failed to schedule account deletion");
        return;
      }

      try {
        await authClient.signOut();
      } catch {}

      window.location.assign("/?accountDeletion=success");
    } catch (submitError: any) {
      setError(submitError?.message || "Failed to schedule account deletion");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="mt-3 flex w-full gap-2">
        <button
          type="button"
          onClick={openModal}
          className="mx-auto mr-2 flex w-full cursor-pointer items-center justify-center gap-2 rounded px-3 py-2 font-semibold text-red-500 md:w-fit"
        >
          Delete account
        </button>
      </div>

      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              closeModal();
            }
          }}
        >
          <div className="w-full max-w-md rounded-lg bg-neutral-100 p-6 shadow-2xl dark:bg-neutral-800">
            <h3 className="text-lg font-semibold">Delete account</h3>

            {!canChangePassword ? (
              <div className="mt-4 space-y-4">
                <p className="text-sm text-neutral-700 dark:text-neutral-300">
                  Account deletion is available only for accounts with password.
                </p>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="cursor-pointer rounded bg-neutral-300 px-3 py-2 text-sm dark:bg-neutral-700"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : step === "confirm" ? (
              <div className="mt-4 space-y-4">
                <p className="text-sm text-neutral-700 dark:text-neutral-300">
                  Your account will be deactivated immediately and scheduled for
                  permanent deletion in 14 days.
                </p>
                <p className="text-sm text-neutral-700 dark:text-neutral-300">
                  If you sign in again within 14 days, your account will be
                  fully restored.
                </p>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="cursor-pointer rounded bg-neutral-300 px-3 py-2 text-sm dark:bg-neutral-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep("password")}
                    className="cursor-pointer rounded bg-red-700 px-3 py-2 text-sm text-white hover:bg-red-600"
                  >
                    Continue
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="mt-4 space-y-4">
                <div className="space-y-1">
                  <label
                    htmlFor="delete-account-password"
                    className="text-sm font-medium"
                  >
                    Account password
                  </label>
                  <input
                    id="delete-account-password"
                    type="password"
                    value={currentPassword}
                    onChange={(event) => setCurrentPassword(event.target.value)}
                    autoComplete="current-password"
                    className="w-full rounded bg-neutral-300 px-2 py-2 ring-neutral-400 outline-none focus:ring-2 dark:bg-neutral-700 dark:ring-neutral-600"
                    disabled={loading}
                  />
                </div>

                {error && (
                  <p className="text-sm font-medium text-red-500">{error}</p>
                )}

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (!loading) {
                        setError(null);
                        setStep("confirm");
                      }
                    }}
                    className="cursor-pointer rounded bg-neutral-300 px-3 py-2 text-sm dark:bg-neutral-700"
                    disabled={loading}
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className={`flex items-center gap-2 rounded px-3 py-2 text-sm font-semibold text-white ${
                      loading
                        ? "cursor-not-allowed bg-red-900 opacity-70"
                        : "cursor-pointer bg-red-700 hover:bg-red-600"
                    }`}
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <Spinner className="size-4" />
                        <span>Deleting...</span>
                      </span>
                    ) : (
                      "Confirm deletion"
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
