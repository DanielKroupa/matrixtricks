import { getRubricPostsPage } from "@/actions/social";
import { getEffectivePostPreference } from "@/app/helpers/post-preferences";
import { VideoFeed } from "@/components/social/VideoFeed";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Texts | Matrix Tricks",
};

export default async function Page() {
  const preference = await getEffectivePostPreference("TEXTS");
  const result = await getRubricPostsPage(
    "TEXTS",
    1,
    preference.postsPerPage,
    preference.sortBy,
  );

  return (
    <div className="container mx-auto">
      <div className="flex items-center justify-between p-6 pb-0"></div>
      <VideoFeed
        rubric="TEXTS"
        initialPosts={result.posts}
        initialHasMore={result.hasMore}
        postsPerPage={preference.postsPerPage}
        sortBy={preference.sortBy}
      />
    </div>
  );
}
