"use client";
import { Heart, Share2, X } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { BsFillPinAngleFill, BsThreeDotsVertical } from "react-icons/bs";
import { FaPen } from "react-icons/fa";
import { IoTrash } from "react-icons/io5";
import { authClient } from "@/lib/auth-client";
import { CommentSection } from "./CommentSection";
import { usePostInteractions } from "../../hooks/usePostInteractions";
import { SocialShareModal } from "./SocialShareModal";
import { UserInfoBubble } from "./UserInfoBubble";

export const PostModal = ({
  post: initialPost,
  onClose,
  mode = "modal",
}: {
  post: any;
  onClose: () => void;
  mode?: "modal" | "page";
}) => {
  const router = useRouter();
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState<string>("");
  const [session, setSession] = useState<any>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const {
    fullPost,
    setFullPost,
    liked,
    likeCount,
    shareCount,
    handleLike,
    handleShareIncrement,
  } = usePostInteractions(initialPost);

  useEffect(() => {
    authClient
      .getSession()
      .then(setSession)
      .catch(() => {});

    if (mode !== "modal") {
      return;
    }

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [mode]);

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

  const handleShare = async () => {
    const url =
      typeof window !== "undefined"
        ? `${window.location.origin}/rubrics/${initialPost.rubric.toLowerCase()}/post/${initialPost.id}`
        : "";
    await handleShareIncrement();
    setShareUrl(url);
    setIsShareOpen(true);
  };

  const sessionUser = session?.user ?? session?.data?.user ?? null;
  const currentUserId = sessionUser?.id ?? null;
  const isAdmin = sessionUser?.role === "admin";
  const postAuthorId = fullPost?.authorId ?? initialPost.authorId;
  const postAuthor = fullPost?.author ?? initialPost.author ?? null;
  const postAuthorName = postAuthor?.name ?? postAuthor?.username ?? null;
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
    } catch (_error) {
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
    } catch (_error) {
      alert("Failed to delete post");
    } finally {
      setIsSaving(false);
    }
  };

  const media = fullPost?.media?.[0] || initialPost.media?.[0];
  const postTitle = fullPost?.title ?? initialPost.title;
  const postContent = fullPost?.content ?? initialPost.content ?? "";
  const normalizedPostContent = postContent.replace(
    /<p>(?:\s|&nbsp;|<br\s*\/?>)*<\/p>/gi,
    "<p><br></p>",
  );
  const isPinned = Boolean(fullPost?.isPinned ?? initialPost.isPinned);
  const rubricName = String(fullPost?.rubric ?? initialPost.rubric ?? "");
  const isTextRubric = rubricName.toUpperCase() === "TEXTS";
  const isTextPageLayout = isTextRubric && mode === "page";

  const handleTogglePin = async () => {
    if (!isAdmin || isSaving) return;

    try {
      setIsSaving(true);
      const response = await fetch(`/api/posts/${initialPost.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isPinned: !isPinned }),
      });

      if (!response.ok) {
        alert("Failed to update pin state");
        return;
      }

      const updatedPost = await response.json();
      setFullPost((prev: any) => ({ ...prev, ...updatedPost }));
      router.refresh();
    } catch {
      alert("Failed to update pin state");
    } finally {
      setIsSaving(false);
      setIsMenuOpen(false);
    }
  };

  const postActionsMenu = canManagePost ? (
    <div className="relative">
      <button
        type="button"
        title="Post actions"
        className="post-menu-button cursor-pointer rounded-full bg-neutral-300 p-1 transition-colors hover:bg-neutral-400 dark:bg-neutral-600 dark:hover:bg-neutral-500"
        onClick={() => setIsMenuOpen((open) => !open)}
        disabled={isSaving}
      >
        <BsThreeDotsVertical />
      </button>
      {isMenuOpen && (
        <div className="post-menu absolute top-8 right-0 z-20 w-36 rounded-md bg-white shadow-lg dark:bg-neutral-700">
          {isAdmin && (
            <button
              type="button"
              className="flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-left text-sm hover:bg-neutral-200/50 dark:hover:bg-neutral-600"
              onClick={handleTogglePin}
              disabled={isSaving}
            >
              <BsFillPinAngleFill />
              {isPinned ? "Unpin" : "Pin"}
            </button>
          )}
          <button
            type="button"
            className="flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-left text-sm hover:bg-neutral-200/50 dark:hover:bg-neutral-600"
            onClick={handleEditPost}
            disabled={isSaving}
          >
            <FaPen />
            Edit
          </button>
          <button
            type="button"
            className="flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-left text-sm text-red-500 hover:bg-neutral-200 dark:text-red-500 dark:hover:bg-neutral-600 dark:hover:text-red-400"
            onClick={handleDeletePost}
            disabled={isSaving}
          >
            <IoTrash />
            Delete
          </button>
        </div>
      )}
    </div>
  ) : null;

  // For text posts in the "Texts" rubric, we use a different layout that emphasizes the content and places interactions at the bottom.
  // For other posts, we use a more media-centric layout.
  if (isTextPageLayout) {
    return (
      <div className="mx-auto w-full max-w-5xl p-4 sm:p-6">
        <div className="overflow-hidden rounded-xl border border-neutral-400 bg-neutral-200/75 shadow dark:border-neutral-700 dark:bg-neutral-700/75">
          <div className="flex items-center justify-between border-b border-neutral-300 px-4 py-3 sm:px-6 dark:border-neutral-700">
            <div>
              <h1 className="line-clamp-2 flex items-center gap-2 text-lg font-semibold text-neutral-900 dark:text-white">
                {isPinned && <BsFillPinAngleFill className="shrink-0" />}
                {postTitle}
              </h1>
              {postAuthorName ? (
                <UserInfoBubble userId={postAuthorId}>
                  <p className="mt-1 text-xs text-neutral-600 dark:text-neutral-300">
                    {postAuthorName}
                  </p>
                </UserInfoBubble>
              ) : null}
            </div>
            <div className="flex items-center gap-2">{postActionsMenu}</div>
          </div>

          {media?.type === "video" ? (
            <video
              src={media.url}
              controls
              className="max-h-[60vh] w-full bg-black object-contain"
            >
              <track kind="captions" />
            </video>
          ) : media?.url ? (
            <div className="relative h-80 w-full bg-black sm:h-105">
              <Image
                src={media.url}
                alt="Content"
                fill
                className="object-contain"
              />
            </div>
          ) : null}

          <div className="px-4 py-5 sm:px-6">
            <div
              className="prose dark:prose-invert max-w-none text-sm sm:text-base"
              dangerouslySetInnerHTML={{ __html: normalizedPostContent }}
            />
          </div>

          <div className="flex items-center justify-start gap-4 border-y border-neutral-300 px-4 py-3 sm:px-6 dark:border-neutral-700">
            <button
              onClick={handleLike}
              title="Like"
              className={`flex cursor-pointer items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                liked
                  ? "border-2 border-pink-500/20 bg-pink-500/20 text-pink-600 dark:text-pink-400"
                  : "border-2 border-neutral-300 bg-neutral-200 text-neutral-700 hover:bg-neutral-400 dark:border-neutral-700 dark:bg-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-600"
              }`}
            >
              <Heart size={16} fill={liked ? "currentColor" : "none"} />
              <span>{likeCount}</span>
            </button>
            <button
              onClick={handleShare}
              title="Share post"
              className="flex cursor-pointer items-center gap-2 rounded-full bg-neutral-300 px-3 py-1.5 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-400 dark:bg-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-600"
            >
              <Image
                src="/icons/share.svg"
                alt="Share"
                width={16}
                height={16}
                className="invert-80 dark:invert-0"
              />
              <span>{shareCount}</span>
            </button>
          </div>

          <div className="h-[60vh] min-h-105">
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

        <SocialShareModal
          isOpen={isShareOpen}
          onClose={() => setIsShareOpen(false)}
          url={shareUrl}
          title={initialPost.title}
          heading="Share post"
        />
      </div>
    );
  }

  return (
    <div className="animate-in fade-in fixed inset-0 z-50 flex items-center justify-center p-0 duration-200 sm:p-6 md:p-4">
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
        onClick={onClose}
      ></button>

      <button
        onClick={onClose}
        title="Close"
        className="absolute top-4 right-4 z-50 cursor-pointer rounded-full bg-black/50 p-2 text-white transition-colors hover:bg-black/70"
      >
        <X size={24} />
      </button>

      <div className="relative z-10 box-border flex h-full w-full max-w-6xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl md:h-[85vh] md:flex-row">
        {/* Left: Media */}
        <div className="relative flex min-h-[40vh] flex-1 items-center justify-center bg-black md:min-h-full">
          {media?.type === "video" ? (
            <div className="relative h-full w-full">
              <video
                src={media.url}
                controls
                className="h-full w-full object-contain"
              >
                <track kind="captions" />
              </video>

              <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-linear-to-b from-black/70 via-black/25 to-transparent" />
              <div className="absolute top-3 right-3 left-3 z-10">
                <h2 className="line-clamp-2 flex items-center gap-2 text-sm leading-snug font-semibold text-white drop-shadow-sm md:text-base">
                  {isPinned && <BsFillPinAngleFill className="shrink-0" />}
                  {postTitle}
                </h2>
                {postAuthorName ? (
                  <UserInfoBubble userId={postAuthorId}>
                    <p className="mt-1 text-xs text-white/90">
                      {postAuthorName}
                    </p>
                  </UserInfoBubble>
                ) : null}
              </div>

              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-linear-to-t from-black/75 via-black/30 to-transparent" />
              <div className="absolute right-3 bottom-3 left-3 z-10 flex items-end justify-between">
                <button onClick={handleLike} title="Like">
                  <Heart size={16} fill={liked ? "currentColor" : "none"} />
                  <span>{likeCount}</span>
                </button>
                <button
                  onClick={handleShare}
                  className="flex items-center gap-2 rounded-full bg-black/45 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-black/60"
                >
                  <Image
                    src="/icons/share.svg"
                    alt="Share"
                    width={16}
                    height={16}
                  />
                  <span>{shareCount}</span>
                </button>
              </div>
            </div>
          ) : media?.url ? (
            <div className="relative h-full w-full">
              <Image
                src={media.url}
                alt="Content"
                fill
                className="object-contain"
              />
              <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-linear-to-b from-black/70 via-black/25 to-transparent" />
              <div className="absolute top-3 right-3 left-3 z-10">
                <h2 className="line-clamp-2 flex items-center gap-2 text-sm leading-snug font-semibold text-white drop-shadow-sm md:text-base">
                  {isPinned && <BsFillPinAngleFill className="shrink-0" />}
                  {postTitle}
                </h2>
                {postAuthorName ? (
                  <UserInfoBubble userId={postAuthorId}>
                    <p className="mt-1 text-xs text-white/90">
                      {postAuthorName}
                    </p>
                  </UserInfoBubble>
                ) : null}
              </div>

              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-linear-to-t from-black/75 via-black/30 to-transparent" />
              <div className="absolute right-3 bottom-3 left-3 z-10 flex items-end justify-center gap-4">
                <button
                  onClick={handleLike}
                  title="Like"
                  className={`flex cursor-pointer items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium text-white transition-colors ${liked ? "bg-pink-500/80" : "bg-black/45 hover:bg-black/60"}`}
                >
                  <Heart size={16} fill={liked ? "currentColor" : "none"} />
                  <span>{likeCount}</span>
                </button>
                <button
                  onClick={handleShare}
                  title="Share"
                  className="flex cursor-pointer items-center gap-2 rounded-full bg-black/45 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-black/60"
                >
                  <Image
                    src="/icons/share.svg"
                    alt="Share"
                    width={16}
                    height={16}
                  />
                  <span> {shareCount}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="relative h-full w-full bg-black">
              <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-linear-to-b from-black/70 via-black/25 to-transparent" />
              <div className="absolute top-3 right-3 left-3 z-10">
                <h2 className="line-clamp-2 flex items-center gap-2 text-sm leading-snug font-semibold text-white drop-shadow-sm md:text-base">
                  {isPinned && <BsFillPinAngleFill className="shrink-0" />}
                  {postTitle}
                </h2>
              </div>

              <div className="absolute inset-0 overflow-y-auto p-6 pt-16 pb-20 md:p-8 md:pt-16 md:pb-24">
                <div
                  className="prose prose-invert max-w-none text-sm md:text-base"
                  dangerouslySetInnerHTML={{ __html: normalizedPostContent }}
                />
              </div>

              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-linear-to-t from-black/75 via-black/30 to-transparent" />
              <div className="absolute right-3 bottom-3 left-3 z-10 flex items-end justify-between">
                <button
                  onClick={handleLike}
                  className={`flex cursor-pointer items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium text-white transition-colors ${liked ? "bg-pink-500/80" : "bg-black/45 hover:bg-black/60"}`}
                >
                  <Heart size={16} fill={liked ? "currentColor" : "none"} />
                  <span>{likeCount}</span>
                </button>
                <button
                  onClick={handleShare}
                  title="Share"
                  className="flex cursor-pointer items-center gap-2 rounded-full bg-black/45 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-black/60"
                >
                  <Image
                    src="/icons/share.svg"
                    alt="Share"
                    width={16}
                    height={16}
                  />
                  <span>{shareCount}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right: Interaction */}
        <div className="flex h-full w-full flex-col bg-white md:w-100 md:border-l dark:border-neutral-700 dark:bg-neutral-700">
          <div className="relative flex-1 overflow-hidden">
            {fullPost ? (
              <CommentSection
                postId={initialPost.id}
                initialComments={fullPost.comments}
                session={session}
                headerRight={postActionsMenu}
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
        heading="Share Video"
      />
    </div>
  );
};
