import { getRubricPostsPage } from "@/actions/social";
import { getEffectivePostPreference } from "@/app/helpers/post-preferences";
import { TextFeed } from "@/components/social/TextFeed";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Texts | Matrix Tricks",
};

export default async function Page() {
  const preference = await getEffectivePostPreference("TEXTS");
  const result = await getRubricPostsPage(
    "TEXTS",
    1,
    preference.postsPerPage,
    preference.sortBy,
  );

  return (
    <div className="mx-auto">
      <div className="flex items-center justify-between p-6 py-2 pb-0"></div>
      <TextFeed
        rubric="TEXTS"
        initialPosts={result.posts}
        initialHasMore={result.hasMore}
        postsPerPage={preference.postsPerPage}
        sortBy={preference.sortBy}
      />
    </div>
  );
}
