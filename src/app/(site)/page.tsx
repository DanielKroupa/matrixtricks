import { getVideoPostsPage } from "@/actions/social";
import { getEffectivePostPreference } from "@/app/helpers/post-preferences";
import { VideoFeed } from "@/app/components/social/VideoFeed";

export default async function Home() {
  const preference = await getEffectivePostPreference("VIDEOS");
  const result = await getVideoPostsPage(
    1,
    preference.postsPerPage,
    preference.sortBy,
  );

  return (
    <div className="mx-auto">
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
