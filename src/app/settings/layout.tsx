import { Navbar } from "../components/layout/Navbar";
import { Copyright } from "../components/layout/Copyright";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto min-h-screen text-black dark:bg-neutral-800 dark:text-white">
      <Navbar />
      <div className="mx-auto my-3 w-full px-1 md:block md:px-0">
        <h3 className="bg-cyan-800 py-2 text-center text-lg font-medium text-white dark:bg-cyan-900">
          User settings
        </h3>
        <div className="flex w-full">
          <div className="w-full rounded-br-md border-r-2 border-b-2 border-neutral-200 p-8 dark:border-neutral-700 dark:bg-neutral-700">
            {children}
          </div>
        </div>
      </div>
      <Copyright />
    </div>
  );
}
