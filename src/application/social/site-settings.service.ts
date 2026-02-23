import { siteSettingsRepository } from "@/infrastructure/social/site-settings.repository";

export const siteSettingsService = {
  async updateGlobalSettings(input: { title: string; bio: string }) {
    await siteSettingsRepository.upsertGlobalSettings(input);
  },
};
