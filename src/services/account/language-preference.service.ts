import { languagePreferenceRepository } from "@/infrastructure/account/language-preference.repository";
import type { AppLocale } from "@/lib/i18n/config";

export const languagePreferenceService = {
  async updateUserLanguage(userId: string, preferredLanguage: AppLocale) {
    return languagePreferenceRepository.updateForUser(
      userId,
      preferredLanguage,
    );
  },
};
