"use client";

import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import {
  getPostPreferenceAction,
  savePostPreferenceAction,
} from "@/actions/post-preferences";
import {
  allowedPostsPerPage,
  postPreferenceSchema,
} from "@/app/helpers/post-preference-schema";
import type { PostSortOption, RubricParam } from "@/domain/social/types";

const filterOptions: Array<{ value: PostSortOption; label: string }> = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "shareCount", label: "Most shares" },
  { value: "likeCount", label: "Most likes" },
  { value: "commentCount", label: "Most comments" },
];

function getRubricFromPathname(pathname: string): RubricParam {
  if (pathname.includes("/rubrics/texts")) return "TEXTS";
  if (pathname.includes("/rubrics/basics")) return "BASICS";
  if (pathname.includes("/rubrics/tricks")) return "TRICKS";
  return "VIDEOS";
}

export function PostSettings() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const pathname = usePathname();
  const router = useRouter();
  const [isPostsMenuOpen, setIsPostsMenuOpen] = useState(false);
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [postsPerPage, setPostsPerPage] = useState<number>(10);
  const [sortBy, setSortBy] = useState<PostSortOption>("newest");

  const rubric = useMemo(
    () => getRubricFromPathname(pathname || "/"),
    [pathname],
  );

  useEffect(() => {
    startTransition(async () => {
      const preference = await getPostPreferenceAction(rubric);
      const validation = postPreferenceSchema.safeParse({
        rubric,
        postsPerPage: preference.postsPerPage,
        sortBy: preference.sortBy,
      });

      if (!validation.success) {
        return;
      }

      setPostsPerPage(validation.data.postsPerPage);
      setSortBy(validation.data.sortBy);
    });
  }, [rubric]);

  useEffect(() => {
    function handleDocumentClick(event: MouseEvent) {
      const target = event.target;

      if (!(target instanceof Node)) {
        return;
      }

      if (containerRef.current?.contains(target)) {
        return;
      }

      setIsPostsMenuOpen(false);
      setIsFilterMenuOpen(false);
    }

    document.addEventListener("mousedown", handleDocumentClick);

    return () => {
      document.removeEventListener("mousedown", handleDocumentClick);
    };
  }, []);

  function handleSave(nextPostsPerPage: number, nextSortBy: PostSortOption) {
    setPostsPerPage(nextPostsPerPage);
    setSortBy(nextSortBy);

    startTransition(async () => {
      await savePostPreferenceAction({
        rubric,
        postsPerPage: nextPostsPerPage,
        sortBy: nextSortBy,
      });

      router.refresh();
    });
  }

  const selectedFilterLabel =
    filterOptions.find((option) => option.value === sortBy)?.label || "Newest";

  return (
    <div
      ref={containerRef}
      className="flex justify-between gap-2 md:justify-baseline"
    >
      <div className="relative">
        <button
          type="button"
          disabled={isPending}
          onClick={() => {
            setIsPostsMenuOpen((state) => !state);
            setIsFilterMenuOpen(false);
          }}
          className="inline-flex min-w-24 cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-neutral-400 bg-neutral-300 px-4 py-2 font-medium transition-colors dark:border-neutral-700 dark:bg-neutral-700"
        >
          Posts
          <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-neutral-400 p-3.5 dark:border-white">
            <p className="text-sm font-semibold">{postsPerPage}</p>
          </div>
        </button>

        <div
          className={`absolute top-12 z-30 min-w-44 rounded-lg border-2 border-neutral-300 bg-neutral-200 p-2 shadow-md transition-all duration-150 dark:border-neutral-600 dark:bg-neutral-700 ${isPostsMenuOpen ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-1 opacity-0"}`}
        >
          <p className="mb-2 px-2 text-sm font-medium">Posts per page</p>
          {allowedPostsPerPage.map((option) => (
            <label
              key={option}
              className="flex cursor-pointer items-center gap-2 rounded px-2 py-1 hover:bg-neutral-300 dark:hover:bg-neutral-600"
            >
              <input
                type="radio"
                checked={postsPerPage === option}
                onChange={() => {
                  setIsPostsMenuOpen(false);
                  handleSave(option, sortBy);
                }}
              />
              <span>{option} posts</span>
            </label>
          ))}
        </div>
      </div>

      <div className="relative">
        <button
          type="button"
          disabled={isPending}
          onClick={() => {
            setIsFilterMenuOpen((state) => !state);
            setIsPostsMenuOpen(false);
          }}
          className="inline-flex min-w-24 cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-neutral-400 bg-neutral-300 px-4 py-3 font-medium transition-colors dark:border-neutral-700 dark:bg-neutral-700"
        >
          <p className="text-black dark:text-white">Filter</p>

          <Image
            src="/icons/filter-arrows.svg"
            alt="filter-icon"
            width={23}
            height={17}
            className="invert-75 dark:invert-0"
          />
        </button>

        <div
          className={`absolute top-12 right-0 z-30 min-w-56 rounded-lg border-2 border-neutral-300 bg-neutral-200 p-2 shadow-md transition-all duration-150 dark:border-neutral-600 dark:bg-neutral-700 ${isFilterMenuOpen ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-1 opacity-0"}`}
        >
          <p className="mb-2 px-2 text-sm font-medium">Sort posts</p>
          {filterOptions.map((option) => (
            <label
              key={option.value}
              className="flex cursor-pointer items-center gap-2 rounded px-2 py-1 hover:bg-neutral-300 dark:hover:bg-neutral-600"
            >
              <input
                type="radio"
                checked={sortBy === option.value}
                onChange={() => {
                  setIsFilterMenuOpen(false);
                  handleSave(postsPerPage, option.value);
                }}
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
