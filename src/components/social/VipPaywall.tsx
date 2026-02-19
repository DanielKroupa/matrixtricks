import Image from "next/image";
import Link from "next/link";

import { FaLock } from "react-icons/fa";

export function VipPaywall({
  post,
  rubric,
  closeHref,
}: {
  post: any;
  rubric: string;
  closeHref?: string;
}) {
  const media = post?.media?.[0];
  const fallbackCloseHref = closeHref || `/rubrics/${rubric}`;

  return (
    <div className="mx-auto w-full px-1 py-2 md:px-0">
      <div className="overflow-hidden rounded-xl border border-neutral-400 bg-neutral-200 shadow dark:border-neutral-600 dark:bg-neutral-700">
        <div className="border-b border-neutral-400 px-4 py-3 dark:border-neutral-600">
          <h1 className="text-lg font-semibold">{post?.title}</h1>
          <p className="font-golden mt-1 flex items-center gap-2 text-base">
            <FaLock size={16} className="text-[#F4BF4F]" />
            This content is available only for VIP members.
          </p>
        </div>

        {media?.type === "video" ? (
          <video
            src={media.url}
            className="h-80 w-full object-cover blur-md"
            muted
            playsInline
          />
        ) : media?.url ? (
          <div className="relative h-80 w-full">
            <Image
              src={media.url}
              alt={post?.title || "VIP post"}
              fill
              className="object-cover blur-md"
            />
          </div>
        ) : null}

        <div className="space-y-3 p-4">
          {post?.content ? (
            <p className="rounded-md bg-neutral-300 p-3 text-sm blur-[2px] select-none dark:bg-neutral-600">
              {post.content}
            </p>
          ) : null}

          <div className="flex items-center gap-3">
            <Link
              href="/settings"
              className="bg-golden hover:bg-golden/90 rounded-md px-4 py-2 text-sm font-medium text-white text-shadow-lg"
            >
              Activate VIP
            </Link>
            <Link
              href={fallbackCloseHref}
              className="rounded-md border border-neutral-500 px-4 py-2 text-sm font-medium"
            >
              Back to rubric
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
