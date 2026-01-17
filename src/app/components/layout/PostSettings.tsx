import Image from "next/image";

export function PostSettings() {
  return (
    <div className="flex gap-2 justify-between md:justify-baseline">
      <button className="py-2 gap-2 px-4 rounded-lg dark:bg-neutral-700 bg-neutral-300 border-2 dark:border-neutral-700 border-neutral-400 min-w-24 inline-flex font-medium items-center justify-center transition-colors">
        Posts
        <div className="rounded-full dark:border-white border-neutral-400 border-2 flex justify-center items-center w-7 h-7">
          <p className="font-semibold text-sm"> 10</p>
        </div>
      </button>
      <button className="py-2 gap-2 px-4 rounded-lg dark:bg-neutral-700 bg-neutral-300 border-2 dark:border-neutral-700 border-neutral-400 min-w-24 inline-flex font-medium items-center justify-center transition-colors">
        <p className="dark:text-white text-black">Filter</p>

        <Image
          src="/icons/filter-arrows.svg"
          alt="filter-icon"
          width={23}
          height={17}
          className="invert-75 dark:invert-0"
        />
      </button>
    </div>
  );
}
