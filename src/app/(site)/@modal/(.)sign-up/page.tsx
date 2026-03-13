import type { Metadata } from "next";
import RegisterForm from "@/components/auth/RegisterForm";
import { getMessages } from "@/lib/i18n/messages";
import { getRequestLocale } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const { metadata } = getMessages(locale);

  return {
    title: metadata.signUpTitle,
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default function Page() {
  return <RegisterForm />;
}
