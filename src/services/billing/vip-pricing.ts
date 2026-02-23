const vipPriceMap = {
  CZK: process.env.STRIPE_VIP_PRICE_CZK,
  EUR: process.env.STRIPE_VIP_PRICE_EUR,
  USD: process.env.STRIPE_VIP_PRICE_USD,
} as const;

export function getConfiguredVipPriceMap() {
  return vipPriceMap;
}

export function getConfiguredVipCurrencies() {
  return Object.entries(vipPriceMap)
    .filter(([, priceId]) => Boolean(priceId))
    .map(([currency]) => currency);
}

export function getVipPriceIdByCurrency(currency: string) {
  const normalizedCurrency = currency.toUpperCase() as keyof typeof vipPriceMap;
  const priceId = vipPriceMap[normalizedCurrency];

  if (!priceId) {
    throw new Error(
      `Unsupported currency ${currency}. Missing Stripe price configuration.`,
    );
  }

  return priceId;
}
