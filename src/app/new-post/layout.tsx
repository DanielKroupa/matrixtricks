import type { Metadata } from "next";
import { forbidden, unauthorized } from "next/navigation";
import { Banner } from "@/components/main/Banner";
import { Footer } from "@/components/main/Footer";
import { Navbar } from "@/components/main/Navbar";
import { Title } from "@/components/main/Title";
import { getServerSession } from "@/lib/get-session";

export const metadata: Metadata = {
  title: "New Post | Matrix Tricks",
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

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
