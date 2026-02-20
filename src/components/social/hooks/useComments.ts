"use client";

import { useState } from "react";
import {
  createComment,
  deleteComment,
  toggleCommentLike,
  updateComment,
} from "@/actions/social";
import type { CommentDTO } from "@/domain/social/types";

export type CommentViewModel = CommentDTO;

export const useComments = (
  initialComments: CommentViewModel[],
  session: any,
) => {
  const [comments, setComments] = useState<CommentViewModel[]>(initialComments);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const sessionUser = session?.user ?? session?.data?.user ?? null;

  const addComment = async (
    postId: string,
    content: string,
    nickname?: string,
  ) => {
    setLoading(true);
    setError("");
    try {
      const result = await createComment({ content, postId, nickname });
      if (result.error) {
        setError(result.error);
        return null;
      }
      if (result.comment) {
        const newComment = {
          ...result.comment,
          user: sessionUser
            ? {
                id: sessionUser.id,
                name: sessionUser.name ?? null,
                image: sessionUser.image ?? null,
                username: sessionUser.username ?? null,
                role: sessionUser.role ?? null,
              }
            : null,
          likes: [],
          _count: { likes: 0 },
        };
        setComments((prev) => [...prev, newComment]);
        return newComment;
      }
      return null;
    } catch (err) {
      setError("Failed to post comment");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateCommentContent = async (commentId: string, content: string) => {
    setError("");
    const result = await updateComment({ commentId, content });
    if (result.error || !result.comment) {
      setError(result.error || "Failed to update comment");
      return null;
    }
    setComments((prev) =>
      prev.map((c) => (c.id === commentId ? { ...c, ...result.comment } : c)),
    );
    return result.comment;
  };

  const removeComment = async (commentId: string) => {
    setError("");
    const result = await deleteComment(commentId);
    if (result.error) {
      setError(result.error);
      return false;
    }
    setComments((prev) => prev.filter((c) => c.id !== commentId));
    return true;
  };

  const toggleLike = async (commentId: string) => {
    const currentUserId = sessionUser?.id;
    if (!currentUserId) {
      setError("You must be signed in to like comments");
      return false;
    }

    setComments((prev) =>
      prev.map((c) => {
        if (c.id !== commentId) return c;
        const hasLiked = (c.likes ?? []).some(
          (like) => like.userId === currentUserId,
        );
        const nextLikes = hasLiked
          ? (c.likes ?? []).filter((like) => like.userId !== currentUserId)
          : [
              ...(c.likes ?? []),
              {
                id: `optimistic-${Date.now()}`,
                userId: currentUserId,
                commentId,
              },
            ];
        const likeDelta = hasLiked ? -1 : 1;
        return {
          ...c,
          likes: nextLikes,
          _count: { ...c._count, likes: (c._count?.likes ?? 0) + likeDelta },
        };
      }),
    );

    const result = await toggleCommentLike(commentId);
    if (result.error) {
      // revert
      setComments((prev) =>
        prev.map((c) => {
          if (c.id !== commentId) return c;
          const hasLiked = (c.likes ?? []).some(
            (like) => like.userId === currentUserId,
          );
          const nextLikes = hasLiked
            ? (c.likes ?? []).filter((like) => like.userId !== currentUserId)
            : [
                ...(c.likes ?? []),
                {
                  id: `optimistic-${Date.now()}`,
                  userId: currentUserId,
                  commentId,
                },
              ];
          const likeDelta = hasLiked ? -1 : 1;
          return {
            ...c,
            likes: nextLikes,
            _count: { ...c._count, likes: (c._count?.likes ?? 0) + likeDelta },
          };
        }),
      );
      setError(result.error);
      return false;
    }
    return true;
  };

  return {
    comments,
    error,
    loading,
    setError,
    addComment,
    updateCommentContent,
    removeComment,
    toggleLike,
  };
};
