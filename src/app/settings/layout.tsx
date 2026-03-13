import type { Metadata } from "next";
import { Copyright } from "@/components/main/Copyright";
import { Navbar } from "@/components/main/Navbar";
import { getMessages } from "@/lib/i18n/messages";
import { getRequestLocale } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const { settings } = getMessages(locale);

  return {
    title: settings.metadataTitle,
    robots: {
      index: false,
      follow: false,
      nocache: true,
    },
  };
}

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getRequestLocale();
  const { settings } = getMessages(locale);

  return (
    <div className="mx-auto my-2 min-h-screen text-black dark:text-white">
      <Navbar />
      <div className="mx-auto my-3 w-full px-1 md:block md:px-0">
        <h3 className="bg-cyan-800 py-2 text-center text-lg font-medium text-white dark:bg-cyan-900">
          {settings.userSettings}
        </h3>
        <div className="block w-full md:flex">
          <div className="w-full rounded-br-md border-r-2 border-b-2 border-neutral-200 p-2 md:p-8 dark:border-neutral-700 dark:bg-neutral-800">
            {children}
          </div>
        </div>
      </div>
      <Copyright />
    </div>
  );
}
