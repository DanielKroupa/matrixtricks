import Image from "next/image";

export function PostSettings() {
  return (
    <div className="flex gap-2 justify-between md:justify-baseline">
      <button className="bg-neutral-700 flex items-center gap-2 px-4 py-2 min-w-24 rounded-lg">
        Posts
        <div className="rounded-full border-white border-2 flex justify-center items-center w-7 h-7">
          <p className="font-semibold text-sm"> 10</p>
        </div>
      </button>
      <button className="bg-neutral-700 flex items-center gap-2 px-4 py-2 min-w-24 rounded-lg">
        <p>Filter</p>

        <Image
          src="/icons/filter-arrows.svg"
          alt="filter-icon"
          width={23}
          height={17}
        />
      </button>
    </div>
  );
}
