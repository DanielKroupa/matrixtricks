import type { AppLocale } from "@/lib/i18n/config";
import prisma from "@/lib/prisma";

export const languagePreferenceRepository = {
  async updateForUser(userId: string, preferredLanguage: AppLocale) {
    return prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        preferredLanguage,
      },
      select: {
        id: true,
        preferredLanguage: true,
      },
    });
  },
};
