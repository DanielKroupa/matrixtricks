import type { Metadata } from "next";
import LoginForm from "@/components/auth/LoginForm";
import { getMessages } from "@/lib/i18n/messages";
import { getRequestLocale } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const { metadata } = getMessages(locale);

  return {
    title: metadata.signInTitle,
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default function Page() {
  return <LoginForm />;
}
