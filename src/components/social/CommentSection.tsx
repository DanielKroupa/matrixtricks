"use client";
import { JSX, ReactNode, useState } from "react";
import { CommentItem } from "./CommentItem";
import { Send, Smile } from "lucide-react";
import dynamic from "next/dynamic";
import { useComments } from "./hooks/useComments";
import type { CommentViewModel } from "./hooks/useComments";

const EmojiPicker = dynamic(() => import("emoji-picker-react"), { ssr: false });

export const CommentSection = ({
  postId,
  initialComments,
  session,
  headerRight,
}: {
  postId: string;
  initialComments: CommentViewModel[];
  session: any;
  headerRight?: ReactNode;
}): JSX.Element => {
  const [content, setContent] = useState("");
  const [nickname, setNickname] = useState("");
  const {
    comments,
    error,
    loading,
    setError,
    addComment,
    toggleLike,
    updateCommentContent,
    removeComment,
  } = useComments(initialComments, session);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const onEmojiClick = (emojiObject: any) => {
    setContent((prev) => prev + emojiObject.emoji);
    setShowEmojiPicker(false);
  };

  const handleCommentUpdated = async (commentId: string, content: string) => {
    const updated = await updateCommentContent(commentId, content);
    return Boolean(updated);
  };

  const handleCommentDeleted = async (commentId: string) => {
    const success = await removeComment(commentId);
    return success;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const newComment = await addComment(
        postId,
        content,
        session ? undefined : nickname,
      );
      if (newComment) {
        setContent("");
        setNickname("");
      }
    } catch (e) {
      setError("Failed to post comment");
    } finally {
    }
  };

  return (
    <div className="flex h-full flex-col bg-white text-black dark:bg-neutral-700 dark:text-white">
      <div className="flex items-center justify-between gap-2 border-b border-neutral-300 p-4 dark:border-neutral-600">
        <h3 className="text-lg font-semibold">Comments ({comments.length})</h3>
        {headerRight}
      </div>

      <div className="custom-scrollbar mb-0 flex-1 overflow-y-auto p-4">
        {comments.length === 0 ? (
          <p className="py-4 text-center text-gray-500 dark:text-gray-400">
            No comments yet. Be the first!
          </p>
        ) : (
          comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              session={session}
              onCommentUpdated={(commentId, content) =>
                handleCommentUpdated(commentId, content)
              }
              onCommentDeleted={(commentId) => handleCommentDeleted(commentId)}
              onToggleLike={() => toggleLike(comment.id)}
            />
          ))
        )}
      </div>

      <div className="mt-auto border-t border-neutral-300 bg-gray-50 p-4 dark:border-neutral-600 dark:bg-neutral-800">
        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
          {error && <p className="text-sm text-red-500">{error}</p>}

          {!session && (
            <input
              className="w-full rounded-md border border-neutral-300 p-2 text-sm transition-colors outline-none focus:border-cyan-500"
              placeholder="Your Nickname (required)"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              required={!session}
            />
          )}

          <div className="relative flex gap-2">
            {showEmojiPicker && (
              <div className="absolute right-0 bottom-full z-10 mb-2">
                <EmojiPicker
                  onEmojiClick={onEmojiClick}
                  width={300}
                  height={400}
                />
              </div>
            )}
            <textarea
              className="flex-1 resize-none rounded-md border border-neutral-300 p-3 pr-20 text-sm transition-colors outline-none focus:border-cyan-500 dark:border-neutral-600 dark:bg-neutral-800 dark:text-white"
              placeholder="Leave a comment..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
            />
            <div className="absolute right-2 bottom-2 flex gap-1">
              <button
                type="button"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="rounded-full p-1.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-yellow-500 dark:text-gray-400 dark:hover:bg-neutral-600 dark:hover:text-yellow-500"
              >
                <Smile size={18} />
              </button>
              <button
                type="submit"
                disabled={loading || !content.trim()}
                className="rounded-full bg-cyan-600 p-1.5 text-white transition-colors hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
