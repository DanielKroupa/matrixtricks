import { getVideoPostsPage } from "@/actions/social";
import { VideoFeed } from "@/components/social/VideoFeed";
import { getEffectivePostPreference } from "@/lib/post-preferences";

export default async function Home() {
  const preference = await getEffectivePostPreference("VIDEOS");
  const result = await getVideoPostsPage(
    1,
    preference.postsPerPage,
    preference.sortBy,
  );

  return (
    <div className="mx-auto">
      <VideoFeed
        rubric="VIDEOS"
        initialPosts={result.posts}
        initialHasMore={result.hasMore}
        postsPerPage={preference.postsPerPage}
        sortBy={preference.sortBy}
        cardAspectClassName="aspect-[6/19]"
      />
    </div>
  );
}
