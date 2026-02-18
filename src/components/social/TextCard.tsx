import { Heart } from "lucide-react";
import Image from "next/image";

interface TextCardProps {
  post: any;
}

export const TextCard = ({ post }: TextCardProps) => {
  const rubricSlug =
    typeof post.rubric === "string" ? post.rubric.toLowerCase() : "texts";
  const postHref = `/rubrics/${rubricSlug}/post/${post.id}`;
  const preview = getTextPreview(post.content ?? "", 150);
  const likesCount = post?._count?.likes ?? 0;
  const sharesCount = post?.shareCount ?? 0;

  return (
    <a
      href={postHref}
      className="block w-full overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-xs transition-colors hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:hover:bg-neutral-700"
    >
      <div className="p-4">
        <h3 className="mb-2 text-base leading-snug font-semibold text-neutral-900 dark:text-white">
          {post.title}
        </h3>
        {preview ? (
          <p className="text-sm text-neutral-600 dark:text-neutral-300">
            {preview}
          </p>
        ) : null}
      </div>

      <div className="flex items-center justify-between border-t border-neutral-200 px-4 py-3 text-sm text-neutral-700 dark:border-neutral-700 dark:text-neutral-300">
        <div className="flex items-center gap-1.5">
          <Heart size={16} />
          <span>{likesCount}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Image src="/icons/share.svg" alt="Share" width={16} height={16} />
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
