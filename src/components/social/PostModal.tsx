"use client";
import { X, Heart, Share2 } from "lucide-react";
import { CommentSection } from "./CommentSection";
import { useState, useEffect } from "react";
import {
  getPostDetails,
  togglePostLike,
  incrementShareCount,
} from "@/actions/social";
import { authClient } from "@/lib/auth-client";
import Image from "next/image";
import { SocialShareModal } from "./SocialShareModal";

export const PostModal = ({
  post: initialPost,
  onClose,
}: {
  post: any;
  onClose: () => void;
}) => {
  const [fullPost, setFullPost] = useState<any>(null);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(initialPost._count?.likes || 0);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    document.body.style.overflow = "hidden";

    const fetchDetails = async () => {
      const details = await getPostDetails(initialPost.id);
      setFullPost(details);
      if (details) {
        setLiked(details.likes?.length > 0);
        setLikeCount(details._count.likes);
      }
    };
    fetchDetails();

    authClient
      .getSession()
      .then(setSession)
      .catch(() => {});

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [initialPost.id]);

  const handleLike = async () => {
    const newLiked = !liked;
    setLiked(newLiked);
    setLikeCount((prev: any) => (newLiked ? prev + 1 : prev - 1));
    await togglePostLike(initialPost.id);
  };

  const handleShare = async () => {
    await incrementShareCount(initialPost.id);
    setIsShareOpen(true);
  };

  const media = fullPost?.media?.[0] || initialPost.media?.[0];

  return (
    <div className="animate-in fade-in fixed inset-0 z-50 flex items-center justify-center p-4 duration-200 sm:p-6">
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
        onClick={onClose}
      />

      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-50 rounded-full bg-black/50 p-2 text-white transition-colors hover:bg-black/70"
      >
        <X size={24} />
      </button>

      <div className="relative z-10 box-border flex h-[85vh] w-full max-w-6xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl md:flex-row">
        {/* Left: Media */}
        <div className="relative flex min-h-[40vh] flex-1 items-center justify-center bg-black md:min-h-full">
          {media?.type === "video" ? (
            <video src={media.url} controls className="max-h-full max-w-full" />
          ) : (
            media?.url && (
              <Image
                src={media.url}
                alt="Content"
                fill
                className="object-contain"
              />
            )
          )}
        </div>

        {/* Right: Interaction */}
        <div className="flex h-full w-full flex-col bg-white md:w-100 md:border-l">
          <div className="flex items-start justify-between border-b bg-white p-4">
            <div className="w-full">
              <div className="mb-3 flex items-center gap-3">
                {fullPost?.author && (
                  <>
                    <div className="relative h-8 w-8 overflow-hidden rounded-full bg-gray-200">
                      {fullPost.author.image && (
                        <Image
                          src={fullPost.author.image}
                          fill
                          alt={fullPost.author.name}
                        />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-semibold">
                        {fullPost.author.name || fullPost.author.username}
                      </p>
                    </div>
                  </>
                )}
              </div>

              <h2 className="text-lg leading-tight font-bold">
                {initialPost.title}
              </h2>

              <div className="mt-4 flex items-center gap-2">
                <button
                  onClick={handleLike}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-full py-1.5 transition-colors ${liked ? "bg-pink-100 text-pink-600" : "bg-gray-100 hover:bg-gray-200"}`}
                >
                  <Heart size={18} fill={liked ? "currentColor" : "none"} />
                  <span className="text-sm font-medium">{likeCount}</span>
                </button>
                <button
                  onClick={handleShare}
                  className="flex flex-1 items-center justify-center gap-2 rounded-full bg-gray-100 py-1.5 transition-colors hover:bg-gray-200"
                >
                  <Share2 size={18} />
                  <span className="text-sm font-medium">Share</span>
                </button>
              </div>
            </div>
          </div>

          <div className="relative flex-1 overflow-hidden">
            {fullPost ? (
              <CommentSection
                postId={initialPost.id}
                initialComments={fullPost.comments}
                session={session}
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900"></div>
              </div>
            )}
          </div>
        </div>
      </div>

      <SocialShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        url={typeof window !== "undefined" ? window.location.href : ""}
        title={initialPost.title}
      />
    </div>
  );
};
