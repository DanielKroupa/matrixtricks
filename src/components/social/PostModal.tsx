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
import { BsThreeDotsVertical } from "react-icons/bs";
import { FaPen } from "react-icons/fa";
import { IoTrash } from "react-icons/io5";
import { useRouter } from "next/navigation";

export const PostModal = ({
  post: initialPost,
  onClose,
}: {
  post: any;
  onClose: () => void;
}) => {
  const router = useRouter();
  const [fullPost, setFullPost] = useState<any>(null);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(initialPost._count?.likes || 0);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState<string>("");
  const [session, setSession] = useState<any>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

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

  useEffect(() => {
    if (!isMenuOpen) return;

    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;
      if (
        !target.closest(".post-menu") &&
        !target.closest(".post-menu-button")
      ) {
        setIsMenuOpen(false);
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isMenuOpen]);

  const handleLike = async () => {
    const newLiked = !liked;
    setLiked(newLiked);
    setLikeCount((prev: any) => (newLiked ? prev + 1 : prev - 1));
    await togglePostLike(initialPost.id);
  };

  const handleShare = async () => {
    const url =
      typeof window !== "undefined"
        ? `${window.location.origin}/rubrics/${initialPost.rubric.toLowerCase()}/post/${initialPost.id}`
        : "";
    await incrementShareCount(initialPost.id);
    setShareUrl(url);
    setIsShareOpen(true);
  };

  const sessionUser = session?.user ?? session?.data?.user ?? null;
  const currentUserId = sessionUser?.id ?? null;
  const isAdmin = sessionUser?.role === "admin";
  const postAuthorId = fullPost?.authorId ?? initialPost.authorId;
  const canManagePost =
    Boolean(currentUserId && postAuthorId && currentUserId === postAuthorId) ||
    isAdmin;

  const handleEditPost = async () => {
    if (!canManagePost || isSaving) return;

    const currentTitle = fullPost?.title ?? initialPost.title ?? "";
    const currentContent = fullPost?.content ?? "";

    const nextTitle = window.prompt("Edit post title", currentTitle);
    if (nextTitle === null) {
      setIsMenuOpen(false);
      return;
    }

    const nextContent = window.prompt("Edit post content", currentContent);
    if (nextContent === null) {
      setIsMenuOpen(false);
      return;
    }

    try {
      setIsSaving(true);
      const response = await fetch(`/api/posts/${initialPost.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: nextTitle,
          content: nextContent,
        }),
      });

      if (!response.ok) {
        alert("Failed to update post");
        return;
      }

      const updatedPost = await response.json();
      setFullPost((prev: any) => ({ ...prev, ...updatedPost }));
      router.refresh();
    } catch (error) {
      alert("Failed to update post");
    } finally {
      setIsSaving(false);
      setIsMenuOpen(false);
    }
  };

  const handleDeletePost = async () => {
    if (!canManagePost || isSaving) return;

    const confirmed = window.confirm("Do you really want to delete this post?");
    if (!confirmed) {
      setIsMenuOpen(false);
      return;
    }

    try {
      setIsSaving(true);
      const response = await fetch(`/api/posts/${initialPost.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        alert("Failed to delete post");
        return;
      }

      setIsMenuOpen(false);
      onClose();
      router.refresh();
    } catch (error) {
      alert("Failed to delete post");
    } finally {
      setIsSaving(false);
    }
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
        title="Close"
        className="absolute top-4 right-4 z-50 cursor-pointer rounded-full bg-black/50 p-2 text-white transition-colors hover:bg-black/70"
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
              <div className="flex items-start justify-between gap-2">
                <h2 className="text-lg leading-tight font-bold">
                  {fullPost?.title ?? initialPost.title}
                </h2>
                {canManagePost && (
                  <div className="relative">
                    <button
                      title="Post actions"
                      className="post-menu-button cursor-pointer rounded-full bg-neutral-200 p-1 transition-colors hover:bg-neutral-300"
                      onClick={() => setIsMenuOpen((open) => !open)}
                      disabled={isSaving}
                    >
                      <BsThreeDotsVertical />
                    </button>
                    {isMenuOpen && (
                      <div className="post-menu absolute top-8 right-0 z-20 w-36 rounded-md bg-white shadow-lg">
                        <button
                          className="flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-left text-sm hover:bg-neutral-200"
                          onClick={handleEditPost}
                          disabled={isSaving}
                        >
                          <FaPen />
                          Edit
                        </button>
                        <button
                          className="flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-left text-sm hover:bg-neutral-200"
                          onClick={handleDeletePost}
                          disabled={isSaving}
                        >
                          <IoTrash />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

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
        url={shareUrl}
        title={initialPost.title}
      />
    </div>
  );
};
