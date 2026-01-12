import Link from "next/link";

const items = [
  { to: "/rubrics/basics", label: "Basics" },
  { to: "/rubrics/texts", label: "Texts" },
  { to: "/rubrics/tricks", label: "Tricks" },
  { to: "/rubrics/videos", label: "Videos" },
];

export function Rubrics() {
  return (
    <div className="overflow-x-auto md:overflow-x-hidden whitespace-nowrap flex gap-2 text-white font-medium scroll-smooth md:touch-pan-x w-auto">
      {items.map(({ to, label }) => (
        <Link
          key={to}
          href={to}
          className={`py-2 px-4 rounded-lg bg-neutral-700 min-w-24 inline-flex font-medium items-center justify-center transition-colors `}
        >
          {label}
        </Link>
      ))}
    </div>
  );
}
