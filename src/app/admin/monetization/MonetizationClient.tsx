"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type VipGrantRecord = {
  id: string;
  startsAt: string;
  endsAt: string | null;
  revokedAt: string | null;
  note: string | null;
  user: {
    id: string;
    email: string;
    name: string;
    username: string | null;
  };
};

type VipPriceRecord = {
  id: string;
  currency: string;
  priceId: string;
  isActive: boolean;
};

type VipPriceAuditRecord = {
  id: string;
  currency: string;
  previousPriceId: string | null;
  nextPriceId: string | null;
  previousIsActive: boolean | null;
  nextIsActive: boolean;
  createdAt: string;
  changedByUser: {
    id: string;
    name: string;
    username: string | null;
    email: string;
  } | null;
};

export function MonetizationClient({
  configuredCurrencies,
  configuredPriceMap,
  initialDbPrices,
  envPriceMap,
}: {
  configuredCurrencies: string[];
  configuredPriceMap: Record<string, string | null | undefined>;
  initialDbPrices: VipPriceRecord[];
  envPriceMap: Record<string, string | null | undefined>;
}) {
  const [userEmail, setUserEmail] = useState("");
  const [userId, setUserId] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [note, setNote] = useState("");
  const [grants, setGrants] = useState<VipGrantRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [prices, setPrices] = useState<VipPriceRecord[]>(initialDbPrices);
  const [auditEvents, setAuditEvents] = useState<VipPriceAuditRecord[]>([]);
  const [newCurrency, setNewCurrency] = useState("");
  const [newPriceId, setNewPriceId] = useState("");

  const hasConfiguredPrices = configuredCurrencies.length > 0;

  const rows = useMemo(() => {
    return Object.entries(configuredPriceMap).map(([currency, value]) => ({
      currency,
      configured: Boolean(value),
      priceId: value || "-",
    }));
  }, [configuredPriceMap]);

  const loadGrants = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        "/api/admin/monetization/vip-grants?limit=30",
        {
          method: "GET",
        },
      );
      const payload = await response.json();

      if (!response.ok) {
        setError(payload?.error || "Failed to load grants");
        return;
      }

      setGrants(payload.grants || []);
    } catch (_error) {
      setError("Failed to load grants");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadPrices = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/monetization/vip-prices", {
        method: "GET",
      });

      const payload = await response.json();

      if (!response.ok) {
        setError(payload?.error || "Failed to load prices");
        return;
      }

      setPrices(payload.dbPrices || []);
      setAuditEvents(payload.auditEvents || []);
    } catch (_error) {
      setError("Failed to load prices");
    }
  }, []);

  useEffect(() => {
    loadGrants();
    loadPrices();
  }, [loadGrants, loadPrices]);

  function upsertLocalPrice(
    currency: string,
    priceId: string,
    isActive: boolean,
  ) {
    const normalizedCurrency = currency.trim().toUpperCase();

    setPrices((previousPrices) => {
      const existing = previousPrices.find(
        (item) => item.currency === normalizedCurrency,
      );

      if (existing) {
        return previousPrices.map((item) =>
          item.currency === normalizedCurrency
            ? { ...item, priceId, isActive }
            : item,
        );
      }

      return [
        ...previousPrices,
        {
          id: `local-${normalizedCurrency}`,
          currency: normalizedCurrency,
          priceId,
          isActive,
        },
      ];
    });
  }

  async function savePrices() {
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const payload = {
        prices: prices.map((item) => ({
          currency: item.currency,
          priceId: item.priceId,
          isActive: item.isActive,
        })),
      };

      const response = await fetch("/api/admin/monetization/vip-prices", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const responsePayload = await response.json();

      if (!response.ok) {
        setError(responsePayload?.error || "Failed to save prices");
        return;
      }

      setSuccess("VIP prices saved");
      setPrices(responsePayload.dbPrices || []);
      await loadPrices();
    } catch (_error) {
      setError("Failed to save prices");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateGrant(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await fetch("/api/admin/monetization/vip-grants", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: userId.trim() || undefined,
          userEmail: userEmail.trim() || undefined,
          endsAt: endsAt ? new Date(endsAt).toISOString() : undefined,
          note: note.trim() || undefined,
        }),
      });

      const payload = await response.json();

      if (!response.ok) {
        setError(payload?.error || "Failed to create grant");
        return;
      }

      setSuccess("VIP grant created");
      setUserEmail("");
      setUserId("");
      setEndsAt("");
      setNote("");
      await loadGrants();
    } catch (_error) {
      setError("Failed to create grant");
    } finally {
      setLoading(false);
    }
  }

  async function handleRevokeGrant(grantId: string) {
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await fetch(
        `/api/admin/monetization/vip-grants/${grantId}/revoke`,
        {
          method: "PATCH",
        },
      );

      const payload = await response.json();

      if (!response.ok) {
        setError(payload?.error || "Failed to revoke grant");
        return;
      }

      setSuccess("VIP grant revoked");
      await loadGrants();
    } catch (_error) {
      setError("Failed to revoke grant");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-md border border-neutral-500 p-4">
        <h4 className="text-base font-semibold">Configured Stripe Prices</h4>
        <p className="mt-1 text-sm text-neutral-300">
          {hasConfiguredPrices
            ? `Available currencies: ${configuredCurrencies.join(", ")}`
            : "No Stripe VIP price configured in environment variables."}
        </p>
        <div className="mt-3 grid gap-2 text-sm">
          {rows.map((row) => (
            <div
              key={row.currency}
              className="flex items-center justify-between rounded bg-neutral-700/40 px-3 py-2"
            >
              <span>{row.currency}</span>
              <span
                className={row.configured ? "text-green-400" : "text-red-400"}
              >
                {row.priceId}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3 rounded-md border border-neutral-500 p-4">
        <h4 className="text-base font-semibold">Admin Price Overrides (DB)</h4>
        <p className="text-sm text-neutral-300">
          DB prices override env prices for active currencies.
        </p>

        <div className="grid gap-2">
          {prices.length === 0 && (
            <p className="text-sm text-neutral-300">No DB overrides yet.</p>
          )}

          {prices.map((item) => (
            <div
              key={item.id}
              className="grid gap-2 rounded bg-neutral-700/40 p-3 md:grid-cols-[110px_1fr_120px]"
            >
              <input
                value={item.currency}
                disabled
                className="rounded bg-neutral-800 px-3 py-2 text-white"
              />
              <input
                value={item.priceId}
                onChange={(event) =>
                  upsertLocalPrice(
                    item.currency,
                    event.target.value,
                    item.isActive,
                  )
                }
                className="rounded bg-neutral-300 px-3 py-2 text-black outline-none dark:bg-neutral-800 dark:text-white"
              />
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={item.isActive}
                  onChange={(event) =>
                    upsertLocalPrice(
                      item.currency,
                      item.priceId,
                      event.target.checked,
                    )
                  }
                />
                Active
              </label>
            </div>
          ))}
        </div>

        <div className="grid gap-2 md:grid-cols-[110px_1fr_130px]">
          <input
            value={newCurrency}
            onChange={(event) =>
              setNewCurrency(event.target.value.toUpperCase())
            }
            placeholder="EUR"
            maxLength={3}
            className="rounded bg-neutral-300 px-3 py-2 text-black outline-none dark:bg-neutral-800 dark:text-white"
          />
          <input
            value={newPriceId}
            onChange={(event) => setNewPriceId(event.target.value)}
            placeholder="price_..."
            className="rounded bg-neutral-300 px-3 py-2 text-black outline-none dark:bg-neutral-800 dark:text-white"
          />
          <button
            type="button"
            onClick={() => {
              if (newCurrency.trim().length !== 3 || !newPriceId.trim()) {
                return;
              }

              upsertLocalPrice(newCurrency, newPriceId.trim(), true);
              setNewCurrency("");
              setNewPriceId("");
            }}
            className="rounded bg-neutral-600 px-3 py-2 text-white hover:bg-neutral-500"
          >
            Add/Update
          </button>
        </div>

        <button
          type="button"
          onClick={savePrices}
          disabled={loading || prices.length === 0}
          className="w-fit rounded bg-cyan-800 px-4 py-2 text-white hover:bg-cyan-900 disabled:opacity-60"
        >
          Save Price Overrides
        </button>

        <div className="rounded bg-neutral-700/40 p-3 text-sm">
          <p className="mb-2 font-medium">Environment fallback</p>
          {Object.entries(envPriceMap).map(([currency, priceId]) => (
            <p key={currency} className="text-neutral-300">
              {currency}: {priceId || "-"}
            </p>
          ))}
        </div>
      </div>

      <div className="space-y-3 rounded-md border border-neutral-500 p-4">
        <h4 className="text-base font-semibold">Price Change History</h4>
        {auditEvents.length === 0 ? (
          <p className="text-sm text-neutral-300">
            No price changes logged yet.
          </p>
        ) : (
          <div className="space-y-2">
            {auditEvents.map((event) => (
              <div
                key={event.id}
                className="rounded bg-neutral-700/40 px-3 py-2 text-sm"
              >
                <p className="font-medium">
                  {event.currency}: {event.previousPriceId || "-"} →{" "}
                  {event.nextPriceId || "-"}
                </p>
                <p className="text-neutral-300">
                  Active: {String(event.previousIsActive)} →{" "}
                  {String(event.nextIsActive)}
                </p>
                <p className="text-neutral-300">
                  By: {event.changedByUser?.email || "Unknown"} |{" "}
                  {new Date(event.createdAt).toLocaleString("cs-CZ")}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      <form
        onSubmit={handleCreateGrant}
        className="space-y-3 rounded-md border border-neutral-500 p-4"
      >
        <h4 className="text-base font-semibold">Create Manual VIP Grant</h4>
        <p className="text-sm text-neutral-300">
          Fill user email or user ID. Leave expiration empty for permanent
          grant.
        </p>
        <div className="grid gap-3 md:grid-cols-2">
          <input
            value={userEmail}
            onChange={(event) => setUserEmail(event.target.value)}
            type="email"
            placeholder="user@email.com"
            className="rounded bg-neutral-300 px-3 py-2 text-black outline-none dark:bg-neutral-800 dark:text-white"
          />
          <input
            value={userId}
            onChange={(event) => setUserId(event.target.value)}
            type="text"
            placeholder="User ID (optional)"
            className="rounded bg-neutral-300 px-3 py-2 text-black outline-none dark:bg-neutral-800 dark:text-white"
          />
          <input
            value={endsAt}
            onChange={(event) => setEndsAt(event.target.value)}
            type="datetime-local"
            className="rounded bg-neutral-300 px-3 py-2 text-black outline-none dark:bg-neutral-800 dark:text-white"
          />
          <input
            value={note}
            onChange={(event) => setNote(event.target.value)}
            type="text"
            placeholder="Internal note"
            className="rounded bg-neutral-300 px-3 py-2 text-black outline-none dark:bg-neutral-800 dark:text-white"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="rounded bg-cyan-800 px-4 py-2 text-white hover:bg-cyan-900 disabled:opacity-60"
        >
          Create VIP Grant
        </button>
      </form>

      <div className="rounded-md border border-neutral-500 p-4">
        <h4 className="text-base font-semibold">Recent VIP Grants</h4>
        <div className="mt-3 space-y-2">
          {grants.length === 0 && (
            <p className="text-sm text-neutral-300">No grants yet.</p>
          )}
          {grants.map((grant) => (
            <div
              key={grant.id}
              className="flex flex-col gap-2 rounded bg-neutral-700/40 px-3 py-2 md:flex-row md:items-center md:justify-between"
            >
              <div className="text-sm">
                <p className="font-medium">
                  {grant.user.name} ({grant.user.email})
                </p>
                <p className="text-neutral-300">
                  Start: {new Date(grant.startsAt).toLocaleString("cs-CZ")} |
                  End:{" "}
                  {grant.endsAt
                    ? new Date(grant.endsAt).toLocaleString("cs-CZ")
                    : "No expiry"}
                </p>
                {grant.revokedAt && (
                  <p className="text-red-300">
                    Revoked: {new Date(grant.revokedAt).toLocaleString("cs-CZ")}
                  </p>
                )}
              </div>

              {!grant.revokedAt && (
                <button
                  type="button"
                  onClick={() => handleRevokeGrant(grant.id)}
                  disabled={loading}
                  className="rounded bg-red-700 px-3 py-1.5 text-sm text-white hover:bg-red-800 disabled:opacity-60"
                >
                  Revoke
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}
      {success && <p className="text-sm text-green-400">{success}</p>}
    </div>
  );
}
