import type { Metadata } from "next";
import { getMessages } from "@/lib/i18n/messages";
import { getRequestLocale } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const { metadata } = getMessages(locale);

  return {
    title: metadata.adminEshopTitle,
    description: metadata.description,
  };
}

export default async function Page() {
  const locale = await getRequestLocale();
  const { admin } = getMessages(locale);

  return (
    <div>
      <h3 className="text-lg font-medium">{admin.eshopTitle}</h3>
      <p className="mt-2 text-neutral-300">{admin.eshopDescription}</p>
    </div>
  );
}
