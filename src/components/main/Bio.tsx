import Link from "next/link";
import { getMainBio } from "@/lib/helpers/main-title";

export async function Bio() {
  const bio = await getMainBio();

  return (
    <>
      {/* Bio */}
      <div className="mx-auto w-full px-1.5 md:w-sm md:px-0">
        <div className="mt-16 rounded-lg border-4 border-cyan-600">
          <div className="bg-cyan-700 px-2 py-2 md:px-4">
            <h3 className="text-center text-xl font-medium text-white">
              Alien
            </h3>
          </div>
          <div className="rounded-b-sm bg-neutral-200 px-4 py-2 dark:bg-neutral-700">
            <h4 className="text-center font-normal text-black dark:text-white">
              {bio}
            </h4>
          </div>
        </div>
        {/* Action buttons */}
        <div className="flex flex-row justify-center gap-2 pt-2 text-lg text-white">
          <Link
            href="/"
            className="basis-2/3 rounded-lg bg-cyan-700 px-4 py-3 text-center font-medium shadow-md shadow-blue-950/30"
          >
            Become a fan
            <span className="ml-2 rounded-md bg-cyan-800 px-3 py-1">3.3k</span>
          </Link>

          <Link
            href="/"
            className="flex cursor-pointer items-center gap-2 rounded-lg border-2 border-neutral-400 bg-neutral-300 px-4 py-2 text-black shadow-neutral-900/25 transition dark:border-none dark:bg-neutral-600 dark:text-white dark:shadow-md"
          >
            Message
          </Link>
        </div>
      </div>
    </>
  );
}
