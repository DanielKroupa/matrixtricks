"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n } from "@/lib/i18n/client";
import { stripLocalePrefix } from "@/lib/i18n/routing";

const items = [
  { to: "/rubrics/basics", key: "rubricBasics" },
  { to: "/rubrics/texts", key: "rubricTexts" },
  { to: "/rubrics/tricks", key: "rubricTricks" },
  { to: "/rubrics/videos", key: "rubricVideos" },
] as const;

const DEFAULT_ACTIVE = "/rubrics/videos";

export function Rubrics() {
  const { dictionary, localizeHref } = useI18n();
  const { newPost } = dictionary;
  const pathname = usePathname();
  const normalizedPathname = stripLocalePrefix(pathname || "/");
  const activeTo =
    items.find((item) => normalizedPathname.startsWith(item.to))?.to ??
    DEFAULT_ACTIVE;

  return (
    <div className="flex w-auto gap-2 overflow-x-auto scroll-smooth font-medium whitespace-nowrap md:touch-pan-x md:overflow-x-clip">
      {items.map(({ to, key }) => {
        const isActive = activeTo === to;
        const itemClass =
          "min-w-24 inline-flex items-center justify-center rounded-lg px-4 py-2 border-2 border-neutral-400 dark:border-neutral-700 font-medium transition " +
          (isActive
            ? "bg-cyan-800 text-white dark:bg-cyan-900"
            : "bg-neutral-300 text-neutral-800 dark:bg-neutral-600 dark:text-white/90");

        return (
          <Link
            key={to}
            href={localizeHref(to)}
            aria-current={isActive ? "page" : undefined}
            className={itemClass}
          >
            {newPost[key]}
          </Link>
        );
      })}
    </div>
  );
}
