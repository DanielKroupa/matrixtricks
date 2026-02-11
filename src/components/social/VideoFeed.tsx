"use client";
import { useState } from "react";
import { VideoCard } from "./VideoCard";
import { PostModal } from "./PostModal";

export const VideoFeed = ({ initialPosts }: { initialPosts: any[] }) => {
  const [selectedPost, setSelectedPost] = useState<any>(null);

  return (
    <>
      <div className="grid grid-cols-3 gap-6 p-1 lg:grid-cols-4 xl:grid-cols-6">
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
