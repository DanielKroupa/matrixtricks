import type { Metadata } from "next";
import { forbidden, unauthorized } from "next/navigation";
import { Banner } from "@/components/main/Banner";
import { Footer } from "@/components/main/Footer";
import { Navbar } from "@/components/main/Navbar";
import { Title } from "@/components/main/Title";
import { getServerSession } from "@/lib/get-session";
import { getMessages } from "@/lib/i18n/messages";
import { getRequestLocale } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const { metadata } = getMessages(locale);

  return {
    title: metadata.newPostTitle,
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
  const session = await getServerSession();
  const user = session?.user;

  if (!user) {
    unauthorized();
  }
  if (user?.role !== "admin") {
    forbidden();
  }

  return (
    <div className="mx-auto min-h-screen text-black dark:bg-neutral-800 dark:text-white">
      <Navbar />
      <Banner />
      <Title />
      {children}
      <Footer />
    </div>
  );
}
