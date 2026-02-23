import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPostDetails } from "@/actions/social";
import { PostModalRoute } from "@/components/social/PostModalRoute";
import { VipPaywall } from "@/components/social/VipPaywall";

function toDescription(content: string | null | undefined, maxLength = 160) {
  if (!content) {
    return "Detail příspěvku na Matrix Tricks.";
  }

  const plainText = content
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();

  if (!plainText) {
    return "Detail příspěvku na Matrix Tricks.";
  }

  if (plainText.length <= maxLength) {
    return plainText;
  }

  return `${plainText.slice(0, maxLength - 1)}…`;
}

export async function generateMetadata({
  params,
}: {
  params:
    | { rubric: string; id: string }
    | Promise<{ rubric: string; id: string }>;
}): Promise<Metadata> {
  const { rubric, id } = (await params) as { rubric: string; id: string };
  const post = await getPostDetails(id);

  if (!post) {
    return {
      title: "Příspěvek nenalezen",
      description: "Požadovaný příspěvek nebyl nalezen.",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const canonicalPath = `/rubrics/${rubric}/post/${post.id}`;
  const description = toDescription(post.content);
  const firstImage = post.media.find((item: typeof post.media[number]) =>
    item.type.startsWith("image"),
  )?.url;

  return {
    title: post.title,
    description,
    alternates: {
      canonical: canonicalPath,
    },
    openGraph: {
      type: "article",
      title: post.title,
      description,
      url: canonicalPath,
      images: firstImage ? [{ url: firstImage, alt: post.title }] : undefined,
    },
    twitter: {
      card: firstImage ? "summary_large_image" : "summary",
      title: post.title,
      description,
      images: firstImage ? [firstImage] : undefined,
    },
  };
}

export default async function PostPage({
  params,
}: {
  params:
    | { rubric: string; id: string }
    | Promise<{ rubric: string; id: string }>;
}) {
  const { rubric, id } = (await params) as { rubric: string; id: string };
  const post = await getPostDetails(id);
  if (!post) notFound();

  if (post.isLocked) {
    return (
      <VipPaywall
        post={post}
        rubric={rubric}
        closeHref={`/rubrics/${rubric}`}
      />
    );
  }

  return (
    <PostModalRoute
      post={post}
      rubric={rubric}
      closeHref={`/rubrics/${rubric}`}
    />
  );
}
