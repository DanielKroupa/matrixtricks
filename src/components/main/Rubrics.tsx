"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { to: "/rubrics/basics", label: "Basics" },
  { to: "/rubrics/texts", label: "Texts" },
  { to: "/rubrics/tricks", label: "Tricks" },
  { to: "/rubrics/videos", label: "Videos" },
];

const DEFAULT_ACTIVE = "/rubrics/videos";

export function Rubrics() {
  const pathname = usePathname();
  const activeTo =
    items.find((item) => pathname?.startsWith(item.to))?.to ?? DEFAULT_ACTIVE;

  return (
    <div className="flex w-auto gap-2 overflow-x-auto scroll-smooth font-medium whitespace-nowrap md:touch-pan-x md:overflow-x-clip">
      {items.map(({ to, label }) => {
        const isActive = activeTo === to;
        const itemClass =
          "min-w-24 inline-flex items-center justify-center rounded-lg px-4 py-2 border-2 border-neutral-400 dark:border-neutral-700 font-medium transition " +
          (isActive
            ? "bg-cyan-800 text-white dark:bg-cyan-900"
            : "bg-neutral-300 text-neutral-800 dark:bg-neutral-600 dark:text-white/90");

        return (
          <Link
            key={to}
            href={to}
            aria-current={isActive ? "page" : undefined}
            className={itemClass}
          >
            {label}
          </Link>
        );
      })}
    </div>
  );
}
