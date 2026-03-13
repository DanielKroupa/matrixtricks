import type { Metadata } from "next";
import { getRubricPostsPage } from "@/actions/social";
import { VideoFeed } from "@/components/social/VideoFeed";
import { getMessages } from "@/lib/i18n/messages";
import { getRequestLocale } from "@/lib/i18n/server";
import { getEffectivePostPreference } from "@/lib/post-preferences";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const { metadata } = getMessages(locale);

  return {
    title: metadata.rubricTricksTitle,
  };
}

export default async function Page() {
  const preference = await getEffectivePostPreference("TRICKS");
  const result = await getRubricPostsPage(
    "TRICKS",
    1,
    preference.postsPerPage,
    preference.sortBy,
  );

  return (
    <div className="mx-auto">
      <VideoFeed
        rubric="TRICKS"
        initialPosts={result.posts}
        initialHasMore={result.hasMore}
        postsPerPage={preference.postsPerPage}
        sortBy={preference.sortBy}
        cardAspectClassName="aspect-[6/19]"
      />
    </div>
  );
}
