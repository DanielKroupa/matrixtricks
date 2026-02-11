"use client";

import React from "react";
import Image from "next/image";
import { Heart, MessageCircle, Share2, Play } from "lucide-react";

// Using exact type would be better, but any for flexibility with Prisma includes
interface VideoCardProps {
  post: any;
  onClick: (post: any) => void;
}

export const VideoCard = ({ post, onClick }: VideoCardProps) => {
  const videoMedia =
    post.media.find((media: any) => media.type === "video") || post.media[0];
  const thumbnailUrl = videoMedia?.url; // In real app, generate thumbnail. For now use same URL or placeholder if video.
  // Ideally we have a thumbnail field or we use a video tag to show poster.

  return (
    <div
      className="group relative aspect-video cursor-pointer overflow-hidden rounded-lg bg-black"
      onClick={() => onClick(post)}
    >
      {thumbnailUrl ? (
        videoMedia.type === "video" ? (
          <video
            src={thumbnailUrl}
            className="h-full w-full object-cover"
            muted
            playsInline
            preload="metadata"
          />
        ) : (
          <Image
            src={thumbnailUrl}
            alt={post.title}
            fill
            className="object-cover"
          />
        )
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-gray-800">
          <Play className="h-12 w-12 text-white" />
        </div>
      )}

      <div className="absolute inset-0 flex flex-col justify-end bg-black/40 p-4 text-white opacity-0 transition-opacity group-hover:opacity-100">
        <h3 className="mb-2 truncate font-bold">{post.title}</h3>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1">
            <Heart size={16} />
            <span>{post._count?.likes || 0}</span>
          </div>
          <div className="flex items-center gap-1">
            <MessageCircle size={16} />
            <span>{post._count?.comments || 0}</span>
          </div>
          <div className="flex items-center gap-1">
            <Share2 size={16} />
            <span>{post.shareCount || 0}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
