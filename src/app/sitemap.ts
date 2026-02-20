import type { MetadataRoute } from "next";
import prisma from "@/lib/prisma";

const fallbackSiteUrl = "https://www.matrixtricks.com";

function getSiteUrl() {
  const rawUrl =
    process.env.NEXT_PUBLIC_APP_URL ??
    process.env.BETTER_AUTH_URL ??
    fallbackSiteUrl;

  try {
    return new URL(rawUrl);
  } catch {
    return new URL(fallbackSiteUrl);
  }
}

function getRubricSlug(rubric: "VIDEOS" | "TEXTS" | "BASICS" | "TRICKS") {
  switch (rubric) {
    case "VIDEOS":
      return "videos";
    case "TEXTS":
      return "texts";
    case "BASICS":
      return "basics";
    case "TRICKS":
      return "tricks";
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: new URL("/", siteUrl).toString(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: new URL("/rubrics/videos", siteUrl).toString(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: new URL("/rubrics/texts", siteUrl).toString(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: new URL("/rubrics/basics", siteUrl).toString(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: new URL("/rubrics/tricks", siteUrl).toString(),
      changeFrequency: "daily",
      priority: 0.9,
    },
  ];

  const posts = await prisma.post.findMany({
    where: { published: true },
    select: {
      id: true,
      rubric: true,
      updatedAt: true,
    },
    orderBy: { updatedAt: "desc" },
  });

  const postRoutes: MetadataRoute.Sitemap = posts.map((post) => ({
    url: new URL(
      `/rubrics/${getRubricSlug(post.rubric)}/post/${post.id}`,
      siteUrl,
    ).toString(),
    lastModified: post.updatedAt,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticRoutes, ...postRoutes];
}
