import { getRubricPosts } from "@/actions/social";
import { VideoFeed } from "@/components/social/VideoFeed";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Texts | Matrix Tricks",
};

export default async function Page() {
  const posts = await getRubricPosts("TEXTS");

  return (
    <div className="container mx-auto">
      <div className="flex items-center justify-between p-6 pb-0"></div>
      <VideoFeed initialPosts={posts} />
    </div>
  );
}
