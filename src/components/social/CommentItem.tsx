"use client";

import { useEffect, useState } from "react";
import { Heart, User as UserIcon } from "lucide-react";
import Image from "next/image";
import { BsThreeDotsVertical } from "react-icons/bs";
import { FaPen } from "react-icons/fa";
import { IoTrash } from "react-icons/io5";
import type { CommentViewModel } from "./hooks/useComments";
import Badge from "@/app/components/ui/Badge";

function renderCommentBody(content: string, className?: string) {
  const paragraphs = content.split("\n");

  return (
    <div className={className}>
      {paragraphs.map((paragraphText, index) => (
        <p
          key={`${index}-${paragraphText.length}`}
          className={index > 0 ? "mt-2" : undefined}
        >
          {paragraphText || "\u00A0"}
        </p>
      ))}
    </div>
  );
}

export const CommentItem = ({
  comment,
  session,
  onCommentUpdated,
  onCommentDeleted,
  onToggleLike,
}: {
  comment: CommentViewModel;
  session: any;
  onCommentUpdated: (commentId: string, content: string) => Promise<boolean>;
  onCommentDeleted: (commentId: string) => Promise<boolean>;
  onToggleLike: () => Promise<boolean>;
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(comment.content);
  const [isSaving, setIsSaving] = useState(false);
  const [actionError, setActionError] = useState("");

  const handleLike = async () => {
    setActionError("");
    const success = await onToggleLike();
    if (!success) {
      setActionError("Failed to update like");
    }
  };

  const user = comment.user;
  const displayName = user?.name || user?.username || comment.nickname || "";
  const avatarUrl = user?.image;
  const sessionUser = session?.user ?? session?.data?.user ?? null;
  const currentUserId = sessionUser?.id;
  const isAdmin = sessionUser?.role === "admin";
  const isOwner = Boolean(comment.userId && currentUserId === comment.userId);
  const canEdit = isOwner;
  const canDelete = isOwner || isAdmin;
  const likedByCurrentUser = (comment.likes ?? []).some(
    (like) => like.userId === currentUserId,
  );
  const likeCount = comment._count?.likes ?? 0;

  useEffect(() => {
    setEditedContent(comment.content);
  }, [comment.content]);

  useEffect(() => {
    if (!isMenuOpen) return;

    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;
      if (
        !target.closest(".comment-menu") &&
        !target.closest(".comment-menu-button")
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

  const handleStartEdit = () => {
    setActionError("");
    setEditedContent(comment.content);
    setIsEditing(true);
    setIsMenuOpen(false);
  };

  const handleSaveEdit = async () => {
    if (!canEdit || isSaving) return;

    const trimmedContent = editedContent.trim();
    if (!trimmedContent) {
      setActionError("Comment cannot be empty");
      return;
    }

    setActionError("");
    setIsSaving(true);

    const success = await onCommentUpdated(comment.id, trimmedContent);
    if (!success) {
      setActionError("Failed to update comment");
      setIsSaving(false);
      return;
    }

    setIsEditing(false);
    setIsSaving(false);
  };

  const handleDelete = async () => {
    if (!canDelete || isSaving) return;

    const confirmed = window.confirm(
      "Do you really want to delete this comment?",
    );
    if (!confirmed) {
      setIsMenuOpen(false);
      return;
    }

    setActionError("");
    setIsSaving(true);
    const success = await onCommentDeleted(comment.id);
    if (!success) {
      setActionError("Failed to delete comment");
      setIsSaving(false);
      return;
    }
  };

  return (
    <div className="flex gap-3 border-neutral-300 py-3 dark:border-neutral-600">
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
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-200 dark:bg-neutral-600">
            <UserIcon size={16} className="text-gray-500 dark:text-gray-400" />
          </div>
        )}
      </div>
      <div className="flex-1">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-sm font-semibold">{displayName}</span>
            {user?.isVipActive && <Badge className="ml-2" />}
            <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
              {new Date(comment.createdAt).toLocaleDateString()}
            </span>
          </div>
          {(canEdit || canDelete) && (
            <div className="relative">
              <button
                title="Comment actions"
                className="comment-menu-button cursor-pointer rounded-full p-1 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-neutral-600 dark:hover:text-gray-200"
                onClick={() => setIsMenuOpen((open) => !open)}
                disabled={isSaving}
              >
                <BsThreeDotsVertical size={14} />
              </button>
              {isMenuOpen && (
                <div className="comment-menu absolute top-7 right-0 z-10 w-32 rounded-md bg-white shadow-lg dark:bg-neutral-700">
                  {canEdit && !isEditing && (
                    <button
                      className="flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-left text-sm hover:bg-neutral-200 dark:hover:bg-neutral-600"
                      onClick={handleStartEdit}
                      disabled={isSaving}
                    >
                      <FaPen size={12} />
                      Edit
                    </button>
                  )}
                  {canDelete && (
                    <button
                      className="flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-left text-sm text-red-500 hover:bg-red-200/50 dark:text-red-300 dark:hover:bg-neutral-600"
                      onClick={handleDelete}
                      disabled={isSaving}
                    >
                      <IoTrash size={14} />
                      Delete
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
        {isEditing ? (
          <div className="mt-2 space-y-2">
            <textarea
              value={editedContent}
              onChange={(event) => setEditedContent(event.target.value)}
              className="w-full resize-none rounded-md border border-neutral-300 bg-white p-2 text-sm text-gray-800 outline-none focus:border-cyan-500 dark:border-neutral-600 dark:bg-neutral-800 dark:text-white"
              rows={3}
              disabled={isSaving}
            />
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="cursor-pointer rounded-md bg-cyan-700 px-2 py-1 text-xs text-white disabled:opacity-50 dark:bg-cyan-600 dark:hover:bg-cyan-500"
                onClick={handleSaveEdit}
                disabled={isSaving}
              >
                Save
              </button>
              <button
                type="button"
                className="cursor-pointer rounded-md border border-neutral-400 px-2 py-1 text-xs text-gray-700 disabled:opacity-50 dark:border-neutral-600 dark:text-gray-400 dark:hover:bg-neutral-600"
                onClick={() => {
                  setIsEditing(false);
                  setEditedContent(comment.content);
                  setActionError("");
                }}
                disabled={isSaving}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-1 rounded-md bg-neutral-200 p-2 text-sm wrap-break-word text-gray-800 shadow dark:bg-neutral-600 dark:text-white">
            {renderCommentBody(comment.content)}
          </div>
        )}
        {actionError && (
          <p className="mt-1 text-xs text-red-500">{actionError}</p>
        )}

        <button
          onClick={handleLike}
          className={`mt-2 flex cursor-pointer items-center gap-1 rounded-md p-1 text-xs transition-colors hover:bg-gray-50 dark:hover:bg-neutral-600 ${likedByCurrentUser ? "text-red-500" : "text-gray-500 dark:text-gray-400"}`}
        >
          <Heart
            size={12}
            fill={likedByCurrentUser ? "currentColor" : "none"}
          />
          <span>{likeCount}</span>
        </button>
      </div>
    </div>
  );
};
