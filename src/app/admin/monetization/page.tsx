import type { Metadata } from "next";
import { forbidden, unauthorized } from "next/navigation";
import { getServerSession } from "@/lib/get-session";
import { getMessages } from "@/lib/i18n/messages";
import { getRequestLocale } from "@/lib/i18n/server";
import { isAdminRole } from "@/lib/roles";
import { vipPriceService } from "@/services/billing/vip-price.service";
import { MonetizationClient } from "./MonetizationClient";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const { metadata } = getMessages(locale);

  return {
    title: metadata.adminMonetizationTitle,
    description: metadata.description,
  };
}

export default async function Page() {
  const locale = await getRequestLocale();
  const { admin } = getMessages(locale);
  const session = await getServerSession();
  const user = session?.user;
  const [dbPrices, effectivePrices] = await Promise.all([
    vipPriceService.listDbPrices(),
    vipPriceService.listEffectivePrices(),
  ]);
  const configuredCurrencies = [
    ...new Set(effectivePrices.map((price) => price.currency)),
  ];
  const configuredPriceMap = Object.fromEntries(
    effectivePrices.map((price) => [
      `${price.interval}:${price.currency}`,
      price.priceId,
    ]),
  );
  const envPriceMap = vipPriceService.getEnvPriceMap();

  if (!user) {
    unauthorized();
  }
  if (!isAdminRole(user?.role)) {
    forbidden();
  }
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium">{admin.monetizationTitle}</h3>
        <p className="mt-2 text-neutral-300">{admin.monetizationDescription}</p>
      </div>
      <MonetizationClient
        configuredCurrencies={configuredCurrencies}
        configuredPriceMap={configuredPriceMap}
        initialDbPrices={dbPrices}
        envPriceMap={envPriceMap}
      />
    </div>
  );
}
