import type { Metadata } from "next";
import { getRubricPostsPage } from "@/actions/social";
import { TextFeed } from "@/components/social/TextFeed";
import { getMessages } from "@/lib/i18n/messages";
import { getRequestLocale } from "@/lib/i18n/server";
import { getEffectivePostPreference } from "@/lib/post-preferences";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const { metadata } = getMessages(locale);

  return {
    title: metadata.rubricTextsTitle,
  };
}

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
