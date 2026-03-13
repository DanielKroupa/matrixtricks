import type { Metadata } from "next";
import { forbidden, unauthorized } from "next/navigation";
import { getServerSession } from "@/lib/get-session";
import { getMessages } from "@/lib/i18n/messages";
import { getRequestLocale } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const { metadata } = getMessages(locale);

  return {
    title: metadata.adminGraphicsTitle,
    description: metadata.description,
  };
}

export default async function Page() {
  const locale = await getRequestLocale();
  const { admin } = getMessages(locale);
  const session = await getServerSession();
  const user = session?.user;

  if (!user) {
    unauthorized();
  }
  if (user?.role !== "admin") {
    forbidden();
  }
  return (
    <div>
      <h3 className="text-lg font-medium">{admin.graphicsTitle}</h3>
      <p className="mt-2 text-neutral-300">{admin.graphicsDescription}</p>
    </div>
  );
}
