import { notFound } from "next/navigation";
import { getPostDetails } from "@/actions/social";
import { PostModalRoute } from "@/components/social/PostModalRoute";

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

  return <PostModalRoute post={post} rubric={rubric} />;
}
