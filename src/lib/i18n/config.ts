export const APP_LOCALES = ["cs", "en"] as const;

export type AppLocale = (typeof APP_LOCALES)[number];

export const DEFAULT_LOCALE: AppLocale = "cs";
export const ENGLISH_LOCALE: AppLocale = "en";

export const LOCALE_COOKIE_NAME = "matrix_locale";

export function isAppLocale(
  value: string | null | undefined,
): value is AppLocale {
  return APP_LOCALES.includes(value as AppLocale);
}

export function getOppositeLocale(locale: AppLocale): AppLocale {
  return locale === "cs" ? "en" : "cs";
}
