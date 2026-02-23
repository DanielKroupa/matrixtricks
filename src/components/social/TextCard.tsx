import { Heart } from "lucide-react";
import Image from "next/image";

interface TextCardProps {
  // biome-ignore lint/suspicious/noExplicitAny: Post DTO differs between endpoints and is gradually being unified.
  post: any;
}

export const TextCard = ({ post }: TextCardProps) => {
  const rubricSlug =
    typeof post.rubric === "string" ? post.rubric.toLowerCase() : "texts";
  const postHref = `/rubrics/${rubricSlug}/post/${post.id}`;
  const preview = getTextPreview(post.content ?? "", 150);
  const likesCount = post?._count?.likes ?? 0;
  const sharesCount = post?.shareCount ?? 0;
  const isLocked = Boolean(post?.isLocked);

  return (
    <a
      href={postHref}
      className="block w-full overflow-hidden rounded-md border border-neutral-400 bg-neutral-200 shadow transition-colors hover:border-neutral-500 hover:bg-neutral-50 dark:border-neutral-600 dark:bg-neutral-700 dark:hover:bg-neutral-600"
    >
      <div className="p-4">
        <h3 className="mb-2 text-base leading-snug font-semibold text-neutral-900 dark:text-white">
          {post.title}
        </h3>
        {isLocked && (
          <p className="mb-2 text-xs font-medium text-yellow-700 dark:text-yellow-400">
            VIP only content
          </p>
        )}
        {preview ? (
          <p
            className={`text-sm text-neutral-600 dark:text-neutral-300 ${isLocked ? "blur-[2px]" : ""}`}
          >
            {preview}
          </p>
        ) : null}
        {isLocked && (
          <p className="mt-2 text-xs font-medium text-cyan-700 dark:text-cyan-400">
            Unlock full post with VIP subscription
          </p>
        )}
      </div>

      <div className="flex items-center justify-end gap-2 border-t border-neutral-400 px-4 py-3 text-sm text-neutral-700 hover:border-neutral-500 md:justify-start dark:border-neutral-500 dark:text-neutral-300 dark:hover:border-neutral-500">
        <div className="flex items-center gap-1.5">
          <Heart size={16} className="text-neutral-700 dark:text-neutral-300" />
          <span>{likesCount}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Image
            src="/icons/share.svg"
            className="invert-80 dark:invert-0"
            alt="Share"
            width={16}
            height={16}
          />
          <span>{sharesCount}</span>
        </div>
      </div>
    </a>
  );
};

function getTextPreview(content: string, maxLength: number) {
  const plainText = content
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();

  if (!plainText) {
    return "";
  }

  if (plainText.length <= maxLength) {
    return plainText;
  }

  return `${plainText.slice(0, maxLength)}...`;
}
