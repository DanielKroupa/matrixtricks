import { getVideoPosts } from "@/actions/social";
import { VideoFeed } from "@/components/social/VideoFeed";

export default async function Home() {
  const posts = await getVideoPosts();

  return (
    <div className="container mx-auto">
      <div className="flex items-center justify-between p-6 pb-0"></div>
      <VideoFeed initialPosts={posts} />
    </div>
  );
}
