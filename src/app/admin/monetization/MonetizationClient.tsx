"use client";

import { usePathname } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { getMessages } from "@/lib/i18n/messages";
import { localeFromPathname } from "@/lib/i18n/routing";

const vipIntervals = ["MONTHLY", "SEMIANNUAL", "YEARLY"] as const;
type VipInterval = (typeof vipIntervals)[number];

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
  interval: VipInterval;
  priceId: string;
  isActive: boolean;
};

type VipPriceAuditRecord = {
  id: string;
  currency: string;
  interval: VipInterval;
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
  const pathname = usePathname();
  const locale = localeFromPathname(pathname || "/");
  const labels = getMessages(locale).admin;
  const dateLocale = locale === "cs" ? "cs-CZ" : "en-US";
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
  const [newInterval, setNewInterval] = useState<VipInterval>("MONTHLY");
  const [newPriceId, setNewPriceId] = useState("");

  const hasConfiguredPrices = configuredCurrencies.length > 0;

  const rows = useMemo(() => {
    return Object.entries(configuredPriceMap).map(([key, value]) => {
      const [interval, currency] = key.split(":");

      return {
        currency,
        interval,
        configured: Boolean(value),
        priceId: value || "-",
      };
    });
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
        setError(payload?.error || labels.loadGrantsFailed);
        return;
      }

      setGrants(payload.grants || []);
    } catch (_error) {
      setError(labels.loadGrantsFailed);
    } finally {
      setLoading(false);
    }
  }, [labels.loadGrantsFailed]);

  const loadPrices = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/monetization/vip-prices", {
        method: "GET",
      });

      const payload = await response.json();

      if (!response.ok) {
        setError(payload?.error || labels.loadPricesFailed);
        return;
      }

      setPrices(payload.dbPrices || []);
      setAuditEvents(payload.auditEvents || []);
    } catch (_error) {
      setError(labels.loadPricesFailed);
    }
  }, [labels.loadPricesFailed]);

  useEffect(() => {
    loadGrants();
    loadPrices();
  }, [loadGrants, loadPrices]);

  function upsertLocalPrice(
    currency: string,
    interval: VipInterval,
    priceId: string,
    isActive: boolean,
  ) {
    const normalizedCurrency = currency.trim().toUpperCase();

    setPrices((previousPrices) => {
      const existing = previousPrices.find(
        (item) =>
          item.currency === normalizedCurrency && item.interval === interval,
      );

      if (existing) {
        return previousPrices.map((item) =>
          item.currency === normalizedCurrency && item.interval === interval
            ? { ...item, priceId, isActive, interval }
            : item,
        );
      }

      return [
        ...previousPrices,
        {
          id: `local-${interval}-${normalizedCurrency}`,
          currency: normalizedCurrency,
          interval,
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
          interval: item.interval,
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
        setError(responsePayload?.error || labels.savePricesFailed);
        return;
      }

      setSuccess(labels.vipPricesSaved);
      setPrices(responsePayload.dbPrices || []);
      await loadPrices();
    } catch (_error) {
      setError(labels.savePricesFailed);
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
        setError(payload?.error || labels.createGrantFailed);
        return;
      }

      setSuccess(labels.vipGrantCreated);
      setUserEmail("");
      setUserId("");
      setEndsAt("");
      setNote("");
      await loadGrants();
    } catch (_error) {
      setError(labels.createGrantFailed);
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
        setError(payload?.error || labels.revokeGrantFailed);
        return;
      }

      setSuccess(labels.vipGrantRevoked);
      await loadGrants();
    } catch (_error) {
      setError(labels.revokeGrantFailed);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-md border border-neutral-500 p-4">
        <h4 className="text-base font-semibold">
          {labels.configuredStripePrices}
        </h4>
        <p className="mt-1 text-sm text-neutral-300">
          {hasConfiguredPrices
            ? `${labels.availableCurrenciesPrefix} ${configuredCurrencies.join(", ")}`
            : labels.noStripePriceConfigured}
        </p>
        <div className="mt-3 grid gap-2 text-sm">
          {rows.map((row) => (
            <div
              key={`${row.interval}:${row.currency}`}
              className="flex items-center justify-between rounded bg-neutral-700/40 px-3 py-2"
            >
              <span>
                {row.interval} / {row.currency}
              </span>
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
        <h4 className="text-base font-semibold">
          {labels.adminPriceOverrides}
        </h4>
        <p className="text-sm text-neutral-300">{labels.dbPricesOverrideEnv}</p>

        <div className="grid gap-2">
          {prices.length === 0 && (
            <p className="text-sm text-neutral-300">
              {labels.noDbOverridesYet}
            </p>
          )}

          {prices.map((item) => (
            <div
              key={item.id}
              className="grid gap-2 rounded bg-neutral-700/40 p-3 md:grid-cols-[160px_110px_1fr_120px]"
            >
              <input
                value={item.interval}
                disabled
                className="rounded bg-neutral-800 px-3 py-2 text-white"
              />
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
                    item.interval,
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
                      item.interval,
                      item.priceId,
                      event.target.checked,
                    )
                  }
                />
                {labels.active}
              </label>
            </div>
          ))}
        </div>

        <div className="grid gap-2 md:grid-cols-[160px_110px_1fr_130px]">
          <select
            value={newInterval}
            onChange={(event) =>
              setNewInterval(event.target.value as VipInterval)
            }
            className="rounded bg-neutral-300 px-3 py-2 text-black outline-none dark:bg-neutral-800 dark:text-white"
          >
            {vipIntervals.map((interval) => (
              <option key={interval} value={interval}>
                {interval}
              </option>
            ))}
          </select>
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

              upsertLocalPrice(
                newCurrency,
                newInterval,
                newPriceId.trim(),
                true,
              );
              setNewCurrency("");
              setNewPriceId("");
            }}
            className="rounded bg-neutral-600 px-3 py-2 text-white hover:bg-neutral-500"
          >
            {labels.addUpdate}
          </button>
        </div>

        <button
          type="button"
          onClick={savePrices}
          disabled={loading || prices.length === 0}
          className="w-fit rounded bg-cyan-800 px-4 py-2 text-white hover:bg-cyan-900 disabled:opacity-60"
        >
          {labels.savePriceOverrides}
        </button>

        <div className="rounded bg-neutral-700/40 p-3 text-sm">
          <p className="mb-2 font-medium">{labels.environmentFallback}</p>
          {Object.entries(envPriceMap).map(([currency, priceId]) => (
            <p key={currency} className="text-neutral-300">
              {currency}: {priceId || "-"}
            </p>
          ))}
        </div>
      </div>

      <div className="space-y-3 rounded-md border border-neutral-500 p-4">
        <h4 className="text-base font-semibold">{labels.priceChangeHistory}</h4>
        {auditEvents.length === 0 ? (
          <p className="text-sm text-neutral-300">{labels.noPriceChangesYet}</p>
        ) : (
          <div className="space-y-2">
            {auditEvents.map((event) => (
              <div
                key={event.id}
                className="rounded bg-neutral-700/40 px-3 py-2 text-sm"
              >
                <p className="font-medium">
                  {event.interval} / {event.currency}:{" "}
                  {event.previousPriceId || "-"} → {event.nextPriceId || "-"}
                </p>
                <p className="text-neutral-300">
                  {labels.active}: {String(event.previousIsActive)} →{" "}
                  {String(event.nextIsActive)}
                </p>
                <p className="text-neutral-300">
                  {labels.by}: {event.changedByUser?.email || labels.unknown} |{" "}
                  {new Date(event.createdAt).toLocaleString(dateLocale)}
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
        <h4 className="text-base font-semibold">
          {labels.createManualVipGrant}
        </h4>
        <p className="text-sm text-neutral-300">
          {labels.createVipGrantDescription}
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
            placeholder={labels.userIdOptional}
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
            placeholder={labels.internalNote}
            className="rounded bg-neutral-300 px-3 py-2 text-black outline-none dark:bg-neutral-800 dark:text-white"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="rounded bg-cyan-800 px-4 py-2 text-white hover:bg-cyan-900 disabled:opacity-60"
        >
          {labels.createVipGrant}
        </button>
      </form>

      <div className="rounded-md border border-neutral-500 p-4">
        <h4 className="text-base font-semibold">{labels.recentVipGrants}</h4>
        <div className="mt-3 space-y-2">
          {grants.length === 0 && (
            <p className="text-sm text-neutral-300">{labels.noGrantsYet}</p>
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
                  {labels.start}:{" "}
                  {new Date(grant.startsAt).toLocaleString(dateLocale)} |
                  {labels.end}:{" "}
                  {grant.endsAt
                    ? new Date(grant.endsAt).toLocaleString(dateLocale)
                    : labels.noExpiry}
                </p>
                {grant.revokedAt && (
                  <p className="text-red-300">
                    {labels.revoked}:{" "}
                    {new Date(grant.revokedAt).toLocaleString(dateLocale)}
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
                  {labels.revoke}
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
