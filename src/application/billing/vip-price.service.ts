import { vipPriceRepository } from "@/infrastructure/billing/vip-price.repository";

const envVipPriceMap = {
  CZK: process.env.STRIPE_VIP_PRICE_CZK,
  EUR: process.env.STRIPE_VIP_PRICE_EUR,
  USD: process.env.STRIPE_VIP_PRICE_USD,
} as const;

function normalizeCurrency(value: string) {
  return value.trim().toUpperCase();
}

export const vipPriceService = {
  getEnvPriceMap() {
    return envVipPriceMap;
  },

  getEnvConfiguredCurrencies() {
    return Object.entries(envVipPriceMap)
      .filter(([, priceId]) => Boolean(priceId))
      .map(([currency]) => currency);
  },

  async listDbPrices() {
    return vipPriceRepository.listAll();
  },

  async listEffectivePrices() {
    const dbPrices = await vipPriceRepository.listAll();
    const merged = new Map<
      string,
      { currency: string; priceId: string; source: "db" | "env" }
    >();

    for (const [currency, priceId] of Object.entries(envVipPriceMap)) {
      if (priceId) {
        merged.set(currency, {
          currency,
          priceId,
          source: "env",
        });
      }
    }

    for (const row of dbPrices) {
      if (!row.isActive) {
        merged.delete(row.currency);
        continue;
      }

      merged.set(row.currency, {
        currency: row.currency,
        priceId: row.priceId,
        source: "db",
      });
    }

    return [...merged.values()].sort((a, b) =>
      a.currency.localeCompare(b.currency),
    );
  },

  async getEffectivePriceIdByCurrency(currency: string) {
    const normalizedCurrency = normalizeCurrency(currency);

    const dbPrices = await vipPriceRepository.listAll();
    const dbRow = dbPrices.find(
      (row) => row.currency === normalizedCurrency && row.isActive,
    );

    if (dbRow?.priceId) {
      return dbRow.priceId;
    }

    const envPriceId =
      envVipPriceMap[normalizedCurrency as keyof typeof envVipPriceMap];

    if (!envPriceId) {
      throw new Error(
        `Unsupported currency ${normalizedCurrency}. Missing Stripe price configuration.`,
      );
    }

    return envPriceId;
  },

  async saveDbPrices(
    rows: Array<{ currency: string; priceId: string; isActive: boolean }>,
    changedByUserId?: string,
  ) {
    const normalizedRows = rows.map((row) => ({
      currency: normalizeCurrency(row.currency),
      priceId: row.priceId.trim(),
      isActive: row.isActive,
    }));

    const previousRows = await vipPriceRepository.listAll();
    const previousByCurrency = new Map(
      previousRows.map((row) => [row.currency, row]),
    );

    const changedRows = normalizedRows
      .map((row) => {
        const previous = previousByCurrency.get(row.currency);
        const hasChanged =
          !previous ||
          previous.priceId !== row.priceId ||
          previous.isActive !== row.isActive;

        if (!hasChanged) {
          return null;
        }

        return {
          currency: row.currency,
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
