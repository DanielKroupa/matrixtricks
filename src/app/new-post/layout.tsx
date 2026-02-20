import { getServerSession } from "@/lib/get-session";
import { Banner } from "../components/Banner";
import { Footer } from "../components/pageLayout/Footer";
import { Navbar } from "../components/pageLayout/Navbar";
import { Title } from "../components/Title";
import { Metadata } from "next";

import { unauthorized, forbidden } from "next/navigation";

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
