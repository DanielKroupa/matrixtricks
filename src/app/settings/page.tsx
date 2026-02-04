import { Metadata } from "next";
import { getServerSession } from "@/lib/get-session";

import { unauthorized } from "next/navigation";
import Link from "next/link";

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
    <div className="flex gap-2">
      <div className="border-r-2 border-b-2 border-l-2 border-neutral-600 rounded-br-md rounded-bl-md">
        <h3 className="p-2 bg-neutral-600 font-medium">User info</h3>
        <span className="text-xl">{user?.name} </span>
        <div className="flex gap-4 items-center">
          <div className="">
            <button className="flex items-center gap-1.5 justify-center px-2 py-1.5 rounded-md bg-neutral-500">
              <span className="size-3 flex rounded-full bg-green-500 p-1"></span>
              Online
            </button>
          </div>
          <div> / </div>
          <div>
            <button className="flex items-center gap-1.5 justify-center px-2 py-1.5 rounded-md bg-neutral-500">
              <span className="size-3 flex rounded-full bg-amber-600 p-1"></span>
              Offline
            </button>
          </div>
        </div>
        <div className="flex gap-4">
          <p className="">
            VIP: <span>Active</span>
          </p>

          <div className="space-y-2 block">
            <p>
              1 Month Subscription <span>(expires 24.12.25)</span>
            </p>
            <Link href="" className="bg-neutral-600 px-3 py-2 rounded-md">
              Buy VIP
            </Link>
          </div>
        </div>
      </div>
      <form className="">
        <h3 className="p-2 bg-neutral-600 font-medium text-center">
          Change password
        </h3>
        <div className="w-full border-r-2 border-l-2 border-b-2 border-neutral-600 rounded-br-md rounded-bl-md">
          <div className="space-y-4 p-4">
            <div className="flex flex-col gap-2">
              <label className="font-normal">Current password:</label>
              <input
                type="password"
                autoComplete="current-password"
                className="dark:bg-neutral-800 bg-neutral-300 rounded px-2 py-1.5 md:w-72 w-full  outline-none"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label>New password:</label>
              <input
                type="password"
                autoComplete="new-password"
                className="dark:bg-neutral-800 bg-neutral-300 rounded px-2 py-1.5 md:w-72 w-full  outline-none"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label>Confirm new password:</label>
              <input
                type="password"
                autoComplete="new-password"
                className="dark:bg-neutral-800 bg-neutral-300 rounded px-2 py-1.5 md:w-72 w-full  outline-none"
              />
            </div>
            <button
              type="submit"
              className="dark:bg-cyan-900 justify-self-center bg-cyan-800 text-white py-2 px-4 rounded-md mr-2 md:w-fit w-full cursor-pointer shadow-md flex justify-center items-center gap-2"
            >
              Update password
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
