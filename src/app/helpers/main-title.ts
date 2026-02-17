import prisma from "@/lib/prisma";

export async function getSiteSettings() {
  const settingsRows = await prisma.$queryRaw<
    Array<{ mainTitle: string; mainBio: string }>
  >`
    SELECT "mainTitle", "mainBio"
    FROM "site_setting"
    WHERE "id" = 'global'
    LIMIT 1
  `;

  const settings = settingsRows[0];

  return {
    title: settings?.mainTitle,
    bio: settings?.mainBio,
  };
}

export async function getMainTitle() {
  const settings = await getSiteSettings();
  return settings.title;
}

export async function getMainBio() {
  const settings = await getSiteSettings();
  return settings.bio;
}
