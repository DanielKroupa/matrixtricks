"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type { VipBillingInterval } from "@/types/billing";

const intervalLabels: Record<VipBillingInterval, string> = {
  MONTHLY: "Monthly",
  SEMIANNUAL: "6 months",
  YEARLY: "Yearly",
};

const vipCurrencyStorageKey = "vip.checkout.currency";

function detectCurrencyFromLocale() {
  if (typeof navigator === "undefined") {
    return "EUR";
  }

  const locale = navigator.language.toLowerCase();

  if (locale.startsWith("cs")) {
    return "CZK";
  }

  const euroLocales = [
    "de",
    "fr",
    "it",
    "es",
    "nl",
    "pt",
    "fi",
    "sk",
    "sl",
    "et",
    "lv",
    "lt",
    "el",
    "at",
    "ie",
    "be",
    "lu",
    "cy",
    "mt",
  ];

  if (euroLocales.some((item) => locale.startsWith(item))) {
    return "EUR";
  }

  return "USD";
}

function getStoredCurrency() {
  if (typeof window === "undefined") {
    return null;
  }

  return localStorage.getItem(vipCurrencyStorageKey);
}

export function VipCheckoutCard({
  isVipActive,
  vipExpiresText,
  priceOptions,
  isAdmin,
}: {
  isVipActive: boolean;
  vipExpiresText: string;
  priceOptions: Array<{ currency: string; interval: VipBillingInterval }>;
  isAdmin: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const availableIntervals = useMemo(
    () =>
      [...new Set(priceOptions.map((item) => item.interval))].sort((a, b) =>
        a.localeCompare(b),
      ),
    [priceOptions],
  );

  const defaultInterval = availableIntervals.includes("MONTHLY")
    ? "MONTHLY"
    : (availableIntervals[0] ?? "MONTHLY");

  const [interval, setInterval] = useState<VipBillingInterval>(defaultInterval);
  const currencies = useMemo(
    () =>
      priceOptions
        .filter((item) => item.interval === interval)
        .map((item) => item.currency)
        .sort((a, b) => a.localeCompare(b)),
    [interval, priceOptions],
  );

  const [currency, setCurrency] = useState(currencies[0] || "EUR");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showResultModal, setShowResultModal] = useState(false);

  const vipResult = searchParams.get("vip");

  useEffect(() => {
    if (!currencies.includes(currency)) {
      const storedCurrency = getStoredCurrency();
      const detectedCurrency = detectCurrencyFromLocale();

      if (storedCurrency && currencies.includes(storedCurrency)) {
        setCurrency(storedCurrency);
        return;
      }

      if (currencies.includes(detectedCurrency)) {
        setCurrency(detectedCurrency);
        return;
      }

      setCurrency(currencies[0] || "EUR");
    }
  }, [currencies, currency]);

  useEffect(() => {
    if (vipResult === "success" || vipResult === "cancelled") {
      setShowResultModal(true);
    }
  }, [vipResult]);

  useEffect(() => {
    if (!availableIntervals.includes(interval)) {
      setInterval(defaultInterval);
    }
  }, [availableIntervals, defaultInterval, interval]);

  const canCheckout = currencies.length > 0;

  function handleCurrencyChange(nextCurrency: string) {
    setCurrency(nextCurrency);

    if (typeof window !== "undefined") {
      localStorage.setItem(vipCurrencyStorageKey, nextCurrency);
    }
  }

  function closeResultModal() {
    setShowResultModal(false);

    const next = new URLSearchParams(searchParams.toString());
    next.delete("vip");

    const query = next.toString();
    router.replace(query ? `${pathname}?${query}` : pathname);
  }

  async function handleCheckout() {
    if (!canCheckout || loading) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ currency, interval }),
      });

      const payload = await response.json();

      if (!response.ok || !payload?.url) {
        setError(payload?.error || "Unable to start checkout");
        return;
      }

      window.location.href = payload.url;
    } catch (_error) {
      setError("Unable to start checkout");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="block space-y-2">
      <p>
        {isVipActive ? "VIP Membership" : "No active VIP"}{" "}
        <span>(expires {vipExpiresText})</span>
      </p>

      {!isAdmin && (
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={interval}
            onChange={(event) =>
              setInterval(event.target.value as VipBillingInterval)
            }
            disabled={availableIntervals.length === 0 || loading}
            className="rounded bg-neutral-300 px-3 py-2 text-black outline-none dark:bg-neutral-800 dark:text-white"
          >
            {availableIntervals.map((item) => (
              <option key={item} value={item}>
                {intervalLabels[item]}
              </option>
            ))}
          </select>
          <select
            value={currency}
            onChange={(event) => handleCurrencyChange(event.target.value)}
            disabled={!canCheckout || loading}
            className="rounded bg-neutral-300 px-3 py-2 text-black outline-none dark:bg-neutral-800 dark:text-white"
          >
            {currencies.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={handleCheckout}
            disabled={!canCheckout || loading}
            className="rounded-md bg-cyan-800 px-3 py-2 text-white disabled:opacity-60"
          >
            {loading ? "Redirecting..." : isVipActive ? "Renew VIP" : "Buy VIP"}
          </button>
          {!canCheckout && (
            <span className="text-sm text-red-300">
              No currency configured.
            </span>
          )}
        </div>
      )}

      {isAdmin && (
        <p className="text-sm text-neutral-300">
          VIP grants and pricing are managed in admin monetization.
        </p>
      )}

      {showResultModal && vipResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-md rounded-md border border-neutral-600 bg-neutral-900 p-4">
            <h4 className="text-base font-semibold">
              {vipResult === "success"
                ? "Payment successful"
                : "Payment cancelled"}
            </h4>
            <p className="mt-2 text-sm text-neutral-300">
              {vipResult === "success"
                ? "Your VIP purchase was completed. Status will update shortly."
                : "You cancelled the checkout before completion."}
            </p>
            <button
              type="button"
              onClick={closeResultModal}
              className="mt-4 rounded bg-cyan-800 px-3 py-2 text-white hover:bg-cyan-900"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {error && <p className="text-sm text-red-400">{error}</p>}
    </div>
  );
}
