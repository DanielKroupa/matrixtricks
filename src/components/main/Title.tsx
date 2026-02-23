import { getMainTitle } from "@/lib/helpers/main-title";

export async function Title() {
  const title = await getMainTitle();

  return (
    <div className="flex w-full justify-center px-2 md:w-auto">
      <div className="my-2 w-full rounded-full border-4 border-cyan-700 px-4 py-2 text-black md:w-xl dark:text-white">
        <h2 className="text-center text-lg font-medium md:text-xl">{title}</h2>
      </div>
    </div>
  );
}
