"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, Pin, Play } from "lucide-react";

// Using exact type would be better, but any for flexibility with Prisma includes
interface VideoCardProps {
  post: any;
}

export const VideoCard = ({ post }: VideoCardProps) => {
  const videoMedia =
    post.media.find((media: any) => media.type === "video") || post.media[0];
  const thumbnailUrl = videoMedia?.url; // In real app, generate thumbnail. For now use same URL or placeholder if video.
  const rubricSlug =
    typeof post.rubric === "string" ? post.rubric.toLowerCase() : "videos";
  const postHref = `/rubrics/${rubricSlug}/post/${post.id}`;
  const isLocked = Boolean(post?.isLocked);
  // Ideally we have a thumbnail field or we use a video tag to show poster.

  return (
    <Link
      href={postHref}
      className="group relative aspect-video cursor-pointer overflow-hidden rounded-lg bg-black"
    >
      {post.isPinned && (
        <div className="absolute top-2 left-2 z-10 rounded-full bg-black/50 p-1 text-white">
          <Pin size={14} />
        </div>
      )}
      {thumbnailUrl ? (
        videoMedia.type === "video" ? (
          <video
            src={thumbnailUrl}
            className={`h-full w-full object-cover ${isLocked ? "blur-sm" : ""}`}
            muted
            playsInline
            preload="metadata"
          />
        ) : (
          <Image
            src={thumbnailUrl}
            alt={post.title}
            fill
            className={`object-cover ${isLocked ? "blur-sm" : ""}`}
          />
        )
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-gray-800">
          <Play className="h-12 w-12 text-white" />
        </div>
      )}

      {isLocked && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/35">
          <div className="rounded-full bg-black/65 px-3 py-1 text-xs font-semibold text-yellow-300">
            VIP LOCKED
          </div>
        </div>
      )}

      <div className="absolute inset-0 flex flex-col justify-end bg-black/40 p-4 text-white opacity-0 transition-opacity group-hover:opacity-100">
        <h3 className="mb-2 truncate text-sm font-bold">{post.title}</h3>
        <div className="flex items-center justify-between gap-4 text-sm">
          <div className="flex items-center gap-1">
            <Heart size={16} />
            <span>{post._count?.likes || 0}</span>
          </div>
          {/* <div className="flex items-center gap-1">
            <MessageCircle size={16} />
            <span>{post._count?.comments || 0}</span>
          </div> */}
          <div className="flex items-center gap-1">
            <Image src="/icons/share.svg" alt="Share" width={16} height={16} />
            <span>{post.shareCount || 0}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};
