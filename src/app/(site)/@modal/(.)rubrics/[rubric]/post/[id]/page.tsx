import { notFound } from "next/navigation";
import { getPostDetails } from "@/actions/social";
import { PostModalRoute } from "@/app/components/social/PostModalRoute";
import { VipPaywall } from "@/app/components/social/VipPaywall";

export default async function RubricPostModalPage({
  params,
}: {
  params:
    | { rubric: string; id: string }
    | Promise<{ rubric: string; id: string }>;
}) {
  const { rubric, id } = (await params) as { rubric: string; id: string };

  const post = await getPostDetails(id);

  if (!post) {
    notFound();
  }

  if (post.isLocked) {
    return (
      <VipPaywall
        post={post}
        rubric={rubric}
        closeHref={`/rubrics/${rubric}`}
      />
    );
  }

  return <PostModalRoute post={post} rubric={rubric} />;
}
