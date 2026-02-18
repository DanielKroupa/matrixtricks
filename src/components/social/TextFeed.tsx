"use client";

import type { PostSortOption, RubricParam } from "@/domain/social/types";
import { useEffect, useState, useTransition } from "react";
import { TextCard } from "./TextCard";
import { getRubricPostsPage } from "@/actions/social";

type TextFeedProps = {
  rubric: RubricParam;
  initialPosts: any[];
  initialHasMore: boolean;
  postsPerPage: number;
  sortBy: PostSortOption;
};

export const TextFeed = ({
  rubric,
  initialPosts,
  initialHasMore,
  postsPerPage,
  sortBy,
}: TextFeedProps) => {
  const [posts, setPosts] = useState(initialPosts);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setPosts(initialPosts);
    setPage(1);
    setHasMore(initialHasMore);
  }, [initialPosts, initialHasMore, postsPerPage, sortBy, rubric]);

  function handleLoadMore() {
    if (!hasMore || isPending) {
      return;
    }

    const nextPage = page + 1;

    startTransition(async () => {
      const result = await getRubricPostsPage(
        rubric,
        nextPage,
        postsPerPage,
        sortBy,
      );

      setPosts((currentPosts) => [...currentPosts, ...result.posts]);
      setHasMore(result.hasMore);
      setPage(nextPage);
    });
  }

  return (
    <div>
      <div className="flex flex-col gap-4 p-1">
        {posts.map((post) => (
          <TextCard key={post.id} post={post} />
        ))}
      </div>

      {hasMore && (
        <div className="mt-5 mb-3 flex justify-center">
          <button
            type="button"
            onClick={handleLoadMore}
            disabled={isPending}
            className="rounded-lg bg-cyan-800 px-5 py-2 font-medium text-white transition hover:bg-cyan-900 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? "Loading..." : "Load more posts"}
          </button>
        </div>
      )}
    </div>
  );
};
