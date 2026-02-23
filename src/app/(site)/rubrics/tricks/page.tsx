import type { Metadata } from "next";
import { getRubricPostsPage } from "@/actions/social";
import { VideoFeed } from "@/components/social/VideoFeed";
import { getEffectivePostPreference } from "@/lib/post-preferences";

export const metadata: Metadata = {
  title: "Tricks | Matrix Tricks",
};

export default async function Page() {
  const preference = await getEffectivePostPreference("TRICKS");
  const result = await getRubricPostsPage(
    "TRICKS",
    1,
    preference.postsPerPage,
    preference.sortBy,
  );

  return (
    <div className="mx-auto">
      <div className="flex items-center justify-between p-6 pb-0"></div>
      <VideoFeed
        rubric="TRICKS"
        initialPosts={result.posts}
        initialHasMore={result.hasMore}
        postsPerPage={preference.postsPerPage}
        sortBy={preference.sortBy}
      />
    </div>
  );
}
