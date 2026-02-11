"use client";

import React, { useState } from "react";
import { toggleCommentLike } from "@/actions/social";
import { Heart, User as UserIcon } from "lucide-react";
import Image from "next/image";

export const CommentItem = ({ comment }: { comment: any }) => {
  const [liked, setLiked] = useState(comment.likes?.length > 0);
  const [likeCount, setLikeCount] = useState(comment._count?.likes || 0);

  const handleLike = async () => {
    const newLiked = !liked;
    setLiked(newLiked);
    setLikeCount((prev: number) => (newLiked ? prev + 1 : prev - 1));

    const result = await toggleCommentLike(comment.id);
    if (result.error) {
      setLiked(!newLiked);
      setLikeCount((prev: number) => (!newLiked ? prev + 1 : prev - 1));
    }
  };

  const user = comment.user;
  const displayName = user?.name || user?.username || comment.nickname;
  const avatarUrl = user?.image;

  return (
    <div className="flex gap-3 border-neutral-300 py-3">
      <div className="flex shrink-0">
        {avatarUrl ? (
          <Image
            src={avatarUrl}
            alt={displayName}
            width={48}
            height={48}
            className="h-12 w-12 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-200">
            <UserIcon size={16} className="text-gray-500" />
          </div>
        )}
      </div>
      <div className="flex-1">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-sm font-semibold">{displayName}</span>
            <span className="ml-2 text-xs text-gray-500">
              {new Date(comment.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
        <p className="mt-1 rounded-md bg-neutral-200 p-2 text-sm wrap-break-word text-gray-800">
          {comment.content}
        </p>

        <button
          onClick={handleLike}
          className={`mt-2 flex items-center gap-1 rounded p-1 text-xs transition-colors hover:bg-gray-50 ${liked ? "text-red-500" : "text-gray-500"}`}
        >
          <Heart size={12} fill={liked ? "currentColor" : "none"} />
          <span>{likeCount}</span>
        </button>
      </div>
    </div>
  );
};
