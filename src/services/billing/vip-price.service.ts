import { vipPriceRepository } from "@/infrastructure/billing/vip-price.repository";
import type { VipBillingInterval } from "@/types/billing";

const supportedCurrencies = ["CZK", "EUR", "USD"] as const;
const supportedIntervals: VipBillingInterval[] = [
  "MONTHLY",
  "SEMIANNUAL",
  "YEARLY",
];

const envVipPriceMap = Object.fromEntries(
  supportedIntervals.flatMap((interval) =>
    supportedCurrencies.map((currency) => {
      const key = `${interval}:${currency}`;
      const fallbackKey = `STRIPE_VIP_PRICE_${currency}`;
      const intervalKey = `STRIPE_VIP_PRICE_${currency}_${interval}`;

      const value =
        process.env[intervalKey] ||
        (interval === "MONTHLY" ? process.env[fallbackKey] : undefined);

      return [key, value ?? null];
    }),
  ),
) as Record<string, string | null>;

function normalizeCurrency(value: string) {
  return value.trim().toUpperCase();
}

function normalizeInterval(value: string): VipBillingInterval {
  const normalized = value.trim().toUpperCase();

  if (
    normalized !== "MONTHLY" &&
    normalized !== "SEMIANNUAL" &&
    normalized !== "YEARLY"
  ) {
    throw new Error(`Unsupported interval ${value}`);
  }

  return normalized;
}

function toPriceKey(currency: string, interval: VipBillingInterval) {
  return `${interval}:${currency}`;
}

export const vipPriceService = {
  getEnvPriceMap() {
    return envVipPriceMap;
  },

  getEnvConfiguredCurrencies() {
    return [
      ...new Set(
        Object.entries(envVipPriceMap)
          .filter(([, priceId]) => Boolean(priceId))
          .map(([key]) => key.split(":")[1]),
      ),
    ];
  },

  async listDbPrices() {
    return vipPriceRepository.listAll();
  },

  async listEffectivePrices() {
    const dbPrices = await vipPriceRepository.listAll();
    const merged = new Map<
      string,
      {
        currency: string;
        interval: VipBillingInterval;
        priceId: string;
        source: "db" | "env";
      }
    >();

    for (const [key, priceId] of Object.entries(envVipPriceMap)) {
      if (priceId) {
        const [interval, currency] = key.split(":");
        const normalizedInterval = normalizeInterval(interval);

        merged.set(key, {
          currency,
          interval: normalizedInterval,
          priceId,
          source: "env",
        });
      }
    }

    for (const row of dbPrices) {
      const key = toPriceKey(row.currency, row.interval as VipBillingInterval);

      if (!row.isActive) {
        merged.delete(key);
        continue;
      }

      merged.set(key, {
        currency: row.currency,
        interval: row.interval as VipBillingInterval,
        priceId: row.priceId,
        source: "db",
      });
    }

    return [...merged.values()].sort(
      (a, b) =>
        a.interval.localeCompare(b.interval) ||
        a.currency.localeCompare(b.currency),
    );
  },

  async getEffectivePriceId(params: {
    currency: string;
    interval: VipBillingInterval;
  }) {
    const normalizedCurrency = normalizeCurrency(params.currency);
    const normalizedInterval = normalizeInterval(params.interval);

    const dbPrices = await vipPriceRepository.listAll();
    const dbRow = dbPrices.find(
      (row) =>
        row.currency === normalizedCurrency &&
        row.interval === normalizedInterval &&
        row.isActive,
    );

    if (dbRow?.priceId) {
      return dbRow.priceId;
    }

    const envPriceId =
      envVipPriceMap[toPriceKey(normalizedCurrency, normalizedInterval)];

    if (!envPriceId) {
      throw new Error(
        `Unsupported VIP selection ${normalizedInterval}/${normalizedCurrency}. Missing Stripe price configuration.`,
      );
    }

    return envPriceId;
  },

  async getEffectivePriceIdByCurrency(currency: string) {
    return this.getEffectivePriceId({ currency, interval: "MONTHLY" });
  },

  async saveDbPrices(
    rows: Array<{
      currency: string;
      interval: VipBillingInterval;
      priceId: string;
      isActive: boolean;
    }>,
    changedByUserId?: string,
  ) {
    const normalizedRows = rows.map((row) => ({
      currency: normalizeCurrency(row.currency),
      interval: normalizeInterval(row.interval),
      priceId: row.priceId.trim(),
      isActive: row.isActive,
    }));

    const previousRows = await vipPriceRepository.listAll();
    const previousByCurrency = new Map(
      previousRows.map((row) => [
        toPriceKey(row.currency, row.interval as VipBillingInterval),
        row,
      ]),
    );

    const changedRows = normalizedRows
      .map((row) => {
        const previous = previousByCurrency.get(
          toPriceKey(row.currency, row.interval),
        );
        const hasChanged =
          !previous ||
          previous.priceId !== row.priceId ||
          previous.isActive !== row.isActive;

        if (!hasChanged) {
          return null;
        }

        return {
          currency: row.currency,
          interval: row.interval,
          previousPriceId: previous?.priceId ?? null,
          nextPriceId: row.priceId,
          previousIsActive: previous?.isActive ?? null,
          nextIsActive: row.isActive,
          changedByUserId,
        };
      })
      .filter((row): row is NonNullable<typeof row> => Boolean(row));

    const updatedRows = await vipPriceRepository.upsertMany(normalizedRows);
    await vipPriceRepository.createAuditEvents(changedRows);

    return updatedRows;
  },

  async listRecentAuditEvents(limit = 50) {
    return vipPriceRepository.listRecentAuditEvents(limit);
  },
};
