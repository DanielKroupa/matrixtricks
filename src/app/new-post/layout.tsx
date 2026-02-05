import { Banner } from "../components/Banner";
import { Footer } from "../components/layout/Footer";
import { Navbar } from "../components/layout/Navbar";
import { Title } from "../components/Title";

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
