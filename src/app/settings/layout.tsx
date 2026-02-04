import { Navbar } from "../components/layout/Navbar";
import { Copyright } from "../components/layout/Copyright";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen mx-auto dark:bg-neutral-800 dark:text-white text-black">
      <Navbar />
      <div className="w-full md:block mx-auto my-3 px-1 md:px-0">
        <h2 className="dark:bg-cyan-900 bg-cyan-800 text-center py-2 font-medium text-white text-lg">
          User settings
        </h2>
        <div className="flex w-full">
          <div className="w-full dark:bg-neutral-700 p-8 border-b-2 border-r-2 rounded-br-md dark:border-neutral-700 border-neutral-200">
            {children}
          </div>
        </div>
      </div>
      <Copyright />
    </div>
  );
}
