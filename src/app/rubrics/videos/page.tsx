import { Banner } from "@/app/components/Banner";
import { Footer } from "@/app/components/layout/Footer";
import { Navbar } from "@/app/components/layout/Navbar";
import { OtherProjects } from "@/app/components/layout/OtherProjects";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Videos | Matrix Tricks",
};

export default function Page() {
  return (
    <>
      <Navbar />
      <Banner />

      <OtherProjects />
      <Footer />
    </>
  );
}
