import { Navbar } from "../components/layout/Navbar";
import AdminSidebar from "./AdminSidebar";
import { Copyright } from "../components/layout/Copyright";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen text-black dark:bg-neutral-800 dark:text-white">
      <Navbar />
      <div className="mx-auto my-3 w-full px-1 md:block md:px-0">
        <h2 className="bg-cyan-800 py-2 text-center text-lg font-medium text-white dark:bg-cyan-900">
          Admin panel
        </h2>
        <div className="flex w-full">
          <AdminSidebar />
          <div className="w-full border-b-2 border-neutral-200 p-4 md:w-5/6 md:rounded-br-md md:border-r-2 md:p-8 dark:border-neutral-700 dark:bg-neutral-800">
            {children}
          </div>
        </div>
      </div>
      <Copyright />
    </div>
  );
}
