import { getServerSession } from "@/lib/get-session";
import { Navbar } from "../components/layout/Navbar";
import { forbidden, unauthorized } from "next/navigation";
import AdminSidebar from "./AdminSidebar";

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
    <div className="min-h-screen bg-neutral-800 text-white">
      <Navbar />
      <div className="w-full md:block mx-auto my-3 px-1 md:px-0">
        <h2 className="bg-cyan-900 text-center py-2 font-medium text-white text-lg">
          Admin panel
        </h2>
        <div className="flex w-full">
          <AdminSidebar />
          <div className="w-5/6 bg-neutral-800 p-8">{children}</div>
        </div>
      </div>
    </div>
  );
}
