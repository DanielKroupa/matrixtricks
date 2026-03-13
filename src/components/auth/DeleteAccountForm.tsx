"use client";

import { useState } from "react";
import { Spinner } from "@/components/ui/spinner";
import { authClient } from "@/lib/auth-client";
import { useI18n } from "@/lib/i18n/client";

type DeleteAccountFormProps = {
  canChangePassword: boolean;
};

export default function DeleteAccountForm({
  canChangePassword,
}: DeleteAccountFormProps) {
  const { dictionary, localizeHref } = useI18n();
  const { auth } = dictionary;
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
      setError(auth.deleteRequiresPassword);
      return;
    }

    if (!currentPassword.trim()) {
      setError(auth.currentPasswordRequired);
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
        setError(data?.error ?? auth.scheduleDeletionFailed);
        return;
      }

      try {
        await authClient.signOut();
      } catch {}

      window.location.assign(localizeHref("/?accountDeletion=success"));
    } catch (submitError: unknown) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : auth.scheduleDeletionFailed,
      );
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
          {auth.deleteAccount}
        </button>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <button
            type="button"
            onClick={closeModal}
            aria-label={auth.closeDeleteModal}
            className="absolute inset-0"
          />
          <div className="w-full max-w-md rounded-lg bg-neutral-100 p-6 shadow-2xl dark:bg-neutral-800">
            <h3 className="text-lg font-semibold">{auth.deleteAccountTitle}</h3>

            {!canChangePassword ? (
              <div className="mt-4 space-y-4">
                <p className="text-sm text-neutral-700 dark:text-neutral-300">
                  {auth.deleteRequiresPassword}
                </p>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="cursor-pointer rounded bg-neutral-300 px-3 py-2 text-sm dark:bg-neutral-700"
                  >
                    {auth.closeText}
                  </button>
                </div>
              </div>
            ) : step === "confirm" ? (
              <div className="mt-4 space-y-4">
                <p className="text-sm text-neutral-700 dark:text-neutral-300">
                  {auth.deletionNotice1}
                </p>
                <p className="text-sm text-neutral-700 dark:text-neutral-300">
                  {auth.deletionNotice2}
                </p>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="cursor-pointer rounded bg-neutral-300 px-3 py-2 text-sm dark:bg-neutral-700"
                  >
                    {auth.cancel}
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep("password")}
                    className="cursor-pointer rounded bg-red-700 px-3 py-2 text-sm text-white hover:bg-red-600"
                  >
                    {auth.continue}
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
                    {auth.accountPassword}
                  </label>
                  <input
                    id="delete-account-password"
                    type="password"
                    value={currentPassword}
                    onChange={(event) => setCurrentPassword(event.target.value)}
                    autoComplete="off"
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
                    {auth.back}
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
                        <span>{auth.deleting}</span>
                      </span>
                    ) : (
                      auth.confirmDeletion
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
