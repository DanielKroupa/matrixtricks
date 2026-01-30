import { getServerSession } from "@/lib/get-session";
import { Banner } from "../components/Banner";
import { Navbar } from "../components/layout/Navbar";
import { Title } from "../components/Title";
import { forbidden, unauthorized } from "next/navigation";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create New Post | Matrix Tricks",
};

export default async function Page() {
  const session = await getServerSession();
  const user = session?.user;

  if (!user) {
    unauthorized();
  }

  if (user.role !== "admin") {
    forbidden();
  }

  return (
    <>
      <Navbar />
      <Banner />
      <Title />
    </>
  );
}
