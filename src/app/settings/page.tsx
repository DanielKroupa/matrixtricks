import { Metadata } from "next";
import { getServerSession } from "@/lib/get-session";
import { Navbar } from "../components/layout/Navbar";
import { unauthorized } from "next/navigation";
import { Footer } from "../components/layout/Footer";

export const metadata: Metadata = {
  title: "Settings | Matrix Tricks",
};

export default async function Page() {
  const session = await getServerSession();
  const user = session?.user;

  if (!user) {
    unauthorized();
  }
  return (
    <>
      <Navbar />
      <main className="">
        <div className="p-4">
          <div className="bg-cyan-800 rounded-tr-lg text-white rounded-tl-lg py-2 p-4 text-center font-medium text-lg">
            User settings
          </div>
          <div className="bg-neutral-700 p-4 flex">
            <div className="grid grid-cols-2 ">
              <div>
                <div className="bg-neutral-600 py-2 w-full px-4 border-r-2 border-l-2 border-b-2 border-neutral-600 rounded-br-md rounded-bl-md">
                  User info
                </div>
              </div>
              <div>sads</div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
