"use client";
import { useState } from "react";
import { VideoCard } from "./VideoCard";
import { PostModal } from "./PostModal";

export const VideoFeed = ({ initialPosts }: { initialPosts: any[] }) => {
  const [selectedPost, setSelectedPost] = useState<any>(null);

  return (
    <>
      <div className="grid grid-cols-1 gap-6 p-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {initialPosts.map((post) => (
          <VideoCard key={post.id} post={post} onClick={setSelectedPost} />
        ))}
      </div>
      {selectedPost && (
        <PostModal post={selectedPost} onClose={() => setSelectedPost(null)} />
      )}
    </>
  );
};
