import { getServerSession } from "@/lib/get-session";
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
    <div className="block md:flex">
      <div className="mx-auto my-3 w-full px-1 md:block md:px-0">
        <h3 className="bg-cyan-800 py-2 text-center text-lg font-medium text-white dark:bg-cyan-900">
          New post
        </h3>
        <form action="" className="bg-neutral-700">
          <div className="flex items-center gap-4 p-4 text-white">
            <span>Choose a type:</span>
            <label
              htmlFor="media"
              className="group cursor-pointer rounded-md border border-cyan-500 bg-cyan-800 px-4 py-2 hover:bg-cyan-900"
            >
              Media
              <input
                type="radio"
                name="media-type"
                id="media"
                className="hidden group-checked:ring-2 group-checked:ring-cyan-400"
              />
            </label>
            <label
              htmlFor="text"
              className="group cursor-pointer rounded-md border border-cyan-500 bg-cyan-800 px-4 py-2 hover:bg-cyan-900"
            >
              Text
              <input
                type="radio"
                name="media-type"
                id="text"
                className="hidden group-checked:ring-2 group-checked:ring-cyan-400"
              />
            </label>
          </div>
          <div>
            <label className="">
              <input
                type="text"
                name="title"
                id="title"
                placeholder="Title"
                className="w-auto rounded bg-neutral-300 px-2 py-1.5 outline-none md:w-72 dark:bg-neutral-600"
              />
            </label>
          </div>
          <div></div>
        </form>
      </div>
    </div>
  );
}
