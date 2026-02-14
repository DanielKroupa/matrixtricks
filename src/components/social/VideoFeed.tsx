"use client";
import { VideoCard } from "./VideoCard";

export const VideoFeed = ({ initialPosts }: { initialPosts: any[] }) => {
  return (
    <div className="grid grid-cols-3 gap-6 p-1 lg:grid-cols-4 xl:grid-cols-6">
      {initialPosts.map((post) => (
        <VideoCard key={post.id} post={post} />
      ))}
    </div>
  );
};
