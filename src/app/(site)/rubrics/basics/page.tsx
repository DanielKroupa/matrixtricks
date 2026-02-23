import type { Metadata } from "next";
import { getRubricPostsPage } from "@/actions/social";
import { VideoFeed } from "@/components/social/VideoFeed";
import { getEffectivePostPreference } from "@/lib/post-preferences";

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
      <VideoFeed
        rubric="BASICS"
        initialPosts={result.posts}
        initialHasMore={result.hasMore}
        postsPerPage={preference.postsPerPage}
        sortBy={preference.sortBy}
        cardAspectClassName="aspect-[6/19]"
      />
    </div>
  );
}
