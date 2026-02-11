"use client";
import { JSX, useState } from "react";
import { createComment } from "@/actions/social";
import { CommentItem } from "./CommentItem";
import { authClient } from "@/lib/auth-client";
import { Send, Smile } from "lucide-react";
import dynamic from "next/dynamic";

const EmojiPicker = dynamic(() => import("emoji-picker-react"), { ssr: false });

export const CommentSection = ({
  postId,
  initialComments,
  session,
}: {
  postId: string;
  initialComments: any[];
  session: any;
}): JSX.Element => {
  const [comments, setComments] = useState(initialComments);
  const [content, setContent] = useState("");
  const [nickname, setNickname] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const onEmojiClick = (emojiObject: any) => {
    setContent((prev) => prev + emojiObject.emoji);
    setShowEmojiPicker(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await createComment({
        content,
        postId,
        nickname: session ? undefined : nickname,
      });
      if (result.error) {
        setError(result.error);
      } else if (result.comment) {
        const newComment = {
          ...result.comment,
          user: session?.user || null,
          likes: [],
          _count: { likes: 0 },
        };
        setComments([...comments, newComment]);
        setContent("");
        setNickname("");
      }
    } catch (e) {
      setError("Failed to post comment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-full flex-col bg-white text-black">
      <div className="border-b border-neutral-300 p-4">
        <h3 className="text-lg font-semibold">Comments ({comments.length})</h3>
      </div>

      <div className="custom-scrollbar mb-0 flex-1 overflow-y-auto p-4">
        {comments.length === 0 ? (
          <p className="py-4 text-center text-gray-500">
            No comments yet. Be the first!
          </p>
        ) : (
          comments.map((comment) => (
            <CommentItem key={comment.id} comment={comment} />
          ))
        )}
      </div>

      <div className="mt-auto border-t border-neutral-300 bg-gray-50 p-4">
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
              className="flex-1 resize-none rounded-md border border-neutral-300 p-3 pr-20 text-sm transition-colors outline-none focus:border-cyan-500"
              placeholder="Leave a comment..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
            />
            <div className="absolute right-2 bottom-2 flex gap-1">
              <button
                type="button"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="rounded-full p-1.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-yellow-500"
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
