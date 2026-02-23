import { getVideoPostsPage } from "@/actions/social";
import { VideoFeed } from "@/components/social/VideoFeed";
import { getEffectivePostPreference } from "@/lib/post-preferences";

type HomeProps = {
  searchParams?:
    | {
        accountDeletion?: string | string[];
      }
    | Promise<{
        accountDeletion?: string | string[];
      }>;
};

export default async function Home({ searchParams }: HomeProps) {
  const resolvedSearchParams =
    searchParams &&
    typeof (searchParams as Promise<unknown>).then === "function"
      ? await searchParams
      : searchParams;

  const accountDeletionParam = (
    resolvedSearchParams as { accountDeletion?: string | string[] } | undefined
  )?.accountDeletion;
  const accountDeletionStatus = Array.isArray(accountDeletionParam)
    ? accountDeletionParam[0]
    : accountDeletionParam;
  const showDeletionSuccess = accountDeletionStatus === "success";

  const preference = await getEffectivePostPreference("VIDEOS");
  const result = await getVideoPostsPage(
    1,
    preference.postsPerPage,
    preference.sortBy,
  );

  return (
    <div className="mx-auto">
      {showDeletionSuccess && (
        <div className="mx-6 mt-6 rounded-md border border-green-600/40 bg-green-900/20 px-4 py-3 text-sm text-green-200">
          Your account was successfully scheduled for deletion. You can restore
          it by signing in again within 14 days.
        </div>
      )}
      <div className="flex items-center justify-between p-6 pb-0"></div>
      <VideoFeed
        rubric="VIDEOS"
        initialPosts={result.posts}
        initialHasMore={result.hasMore}
        postsPerPage={preference.postsPerPage}
        sortBy={preference.sortBy}
      />
    </div>
  );
}
