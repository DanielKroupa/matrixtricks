import prisma from "@/lib/prisma";

export const siteSettingsRepository = {
  async upsertGlobalSettings(input: { title: string; bio: string }) {
    await prisma.siteSetting.upsert({
      where: { id: "global" },
      update: { mainTitle: input.title, mainBio: input.bio },
      create: {
        id: "global",
        mainTitle: input.title,
        mainBio: input.bio,
      },
    });
  },
};
