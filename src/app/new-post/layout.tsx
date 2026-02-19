import { Banner } from "../components/Banner";
import { Footer } from "../components/pageLayout/Footer";
import { Navbar } from "../components/pageLayout/Navbar";
import { Title } from "../components/Title";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "New Post | Matrix Tricks",
};

export default function Layout({ children }: { children: React.ReactNode }) {
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
