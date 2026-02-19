"use client";

import { useState } from "react";

export function VipCheckoutCard({
  isVipActive,
  vipExpiresText,
  currencies,
  isAdmin,
}: {
  isVipActive: boolean;
  vipExpiresText: string;
  currencies: string[];
  isAdmin: boolean;
}) {
  const [currency, setCurrency] = useState(currencies[0] || "EUR");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const canCheckout = currencies.length > 0;

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
        body: JSON.stringify({ currency }),
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
            value={currency}
            onChange={(event) => setCurrency(event.target.value)}
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

      {error && <p className="text-sm text-red-400">{error}</p>}
    </div>
  );
}
