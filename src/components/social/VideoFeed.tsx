"use client";
import { useEffect, useState, useTransition } from "react";
import { getRubricPostsPage } from "@/actions/social";
import type { PostSortOption, RubricParam } from "@/types/social";
import { VideoCard } from "./VideoCard";

type VideoFeedProps = {
  rubric: RubricParam;
  // biome-ignore lint/suspicious/noExplicitAny: Feed item DTO is currently polymorphic across rubrics.
  initialPosts: any[];
  initialHasMore: boolean;
  postsPerPage: number;
  sortBy: PostSortOption;
  cardAspectClassName?: string;
};

export const VideoFeed = ({
  rubric,
  initialPosts,
  initialHasMore,
  postsPerPage,
  sortBy,
  cardAspectClassName = "aspect-video",
}: VideoFeedProps) => {
  const [posts, setPosts] = useState(initialPosts);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setPosts(initialPosts);
    setPage(1);
    setHasMore(initialHasMore);
  }, [initialPosts, initialHasMore]);

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
    <div className="my-1 grid grid-cols-3 gap-3 p-1 md:gap-6 lg:grid-cols-4 xl:grid-cols-6">
      {posts.map((post) => (
        <VideoCard
          key={post.id}
          post={post}
          aspectClassName={cardAspectClassName}
        />
      ))}

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
