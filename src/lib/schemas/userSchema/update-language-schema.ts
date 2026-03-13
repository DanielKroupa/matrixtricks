import { z } from "zod";
import { APP_LOCALES } from "@/lib/i18n/config";

export const updateLanguageSchema = z.object({
  preferredLanguage: z.enum(APP_LOCALES),
});

export type UpdateLanguageInput = z.infer<typeof updateLanguageSchema>;
