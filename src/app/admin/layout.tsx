import type { Metadata } from "next";
import { Copyright } from "@/components/main/Copyright";
import { Navbar } from "@/components/main/Navbar";
import { getMessages } from "@/lib/i18n/messages";
import { getRequestLocale } from "@/lib/i18n/server";
import AdminSidebar from "./AdminSidebar";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const { metadata } = getMessages(locale);

  return {
    title: metadata.adminLayoutTitle,
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
  const { admin } = getMessages(locale);

  return (
    <div className="min-h-screen text-black dark:text-white">
      <Navbar />
      <div className="mx-auto my-3 w-full px-1 md:block md:px-0">
        <h2 className="bg-cyan-800 py-2 text-center text-lg font-medium text-white dark:bg-cyan-900">
          {admin.panelTitle}
        </h2>
        <div className="flex w-full">
          <AdminSidebar />
          <div className="w-full border-b-2 border-neutral-200 p-2 md:w-3/4 md:rounded-br-md md:border-r-2 md:p-8 lg:w-5/6 dark:border-neutral-700 dark:bg-neutral-800">
            {children}
          </div>
        </div>
      </div>
      <Copyright />
    </div>
  );
}
