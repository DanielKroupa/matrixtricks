import { Navbar } from "../components/layout/Navbar";
import AdminSidebar from "./AdminSidebar";
import { Copyright } from "../components/layout/Copyright";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen dark:bg-neutral-800 dark:text-white text-black">
      <Navbar />
      <div className="w-full md:block mx-auto my-3 px-1 md:px-0">
        <h2 className="dark:bg-cyan-900 bg-cyan-800 text-center py-2 font-medium text-white text-lg">
          Admin panel
        </h2>
        <div className="flex w-full">
          <AdminSidebar />
          <div className="w-5/6 dark:bg-neutral-800 md:p-8 p-4 border-b-2 border-r-2 rounded-br-md dark:border-neutral-700 border-neutral-200">
            {children}
          </div>
        </div>
      </div>
      <Copyright />
    </div>
  );
}
