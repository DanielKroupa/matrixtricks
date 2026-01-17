import { Metadata } from "next";
import { getServerSession } from "@/lib/get-session";
import { Navbar } from "../components/layout/Navbar";
import { forbidden, unauthorized } from "next/navigation";

export const metadata: Metadata = {
  title: "Admin settings | Matrix Tricks",
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
      <Navbar />;
    </>
  );
}
