import Link from "next/link";

export function Bio() {
  return (
    <>
      {/* Bio */}
      <div className="md:w-sm w-full md:px-0 px-1.5 mx-auto">
        <div
          className="border-4 rounded-lg border-cyan-600
         mt-16"
        >
          <div className="bg-cyan-700 py-2 md:px-4 px-2">
            <h3 className="text-xl font-medium text-white  text-center">
              Alien
            </h3>
          </div>
          <div className="dark:bg-neutral-700 bg-neutral-200 py-2 px-4 rounded-b-sm">
            <h4 className="text-center dark:text-white text-black font-normal">
              Basketball player, Creator, Visionair From Prague, Czech
              Republic..
            </h4>
          </div>
        </div>
        {/* Action buttons */}
        <div className="flex flex-row text-white gap-2 text-lg pt-2 justify-center">
          <Link
            href="/"
            className="bg-cyan-700 py-3 px-4 rounded-lg basis-2/3 text-center font-medium shadow-md shadow-blue-950/30"
          >
            Become a fan
            <span className="px-3 ml-2 py-1 rounded-md bg-cyan-800">3.3k</span>
          </Link>

          <Link
            href="/"
            className="flex items-center gap-2 rounded-lg dark:bg-neutral-600 bg-neutral-300 border-2 dark:border-none border-neutral-400 px-4 py-2 dark:text-white text-black transition cursor-pointer dark:shadow-md shadow-neutral-900/25"
          >
            Message
          </Link>
        </div>
      </div>
    </>
  );
}
