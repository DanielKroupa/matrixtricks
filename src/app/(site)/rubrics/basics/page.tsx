import { getRubricPostsPage } from "@/actions/social";
import { getEffectivePostPreference } from "@/lib/helpers/post-preferences";
import { VideoFeed } from "@/components/social/VideoFeed";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Basics | Matrix Tricks",
};

export default async function Page() {
  const preference = await getEffectivePostPreference("BASICS");
  const result = await getRubricPostsPage(
    "BASICS",
    1,
    preference.postsPerPage,
    preference.sortBy,
  );

  return (
    <div className="mx-auto">
      <div className="flex items-center justify-between p-6 pb-0"></div>
      <VideoFeed
        rubric="BASICS"
        initialPosts={result.posts}
        initialHasMore={result.hasMore}
        postsPerPage={preference.postsPerPage}
        sortBy={preference.sortBy}
      />
    </div>
  );
}
