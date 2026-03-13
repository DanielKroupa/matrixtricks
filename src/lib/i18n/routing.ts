import {
  type AppLocale,
  DEFAULT_LOCALE,
  ENGLISH_LOCALE,
} from "@/lib/i18n/config";

const EN_PREFIX = `/${ENGLISH_LOCALE}`;

export function stripLocalePrefix(pathname: string) {
  if (pathname === EN_PREFIX) {
    return "/";
  }

  if (pathname.startsWith(`${EN_PREFIX}/`)) {
    return pathname.slice(EN_PREFIX.length);
  }

  if (pathname === "/cs") {
    return "/";
  }

  if (pathname.startsWith("/cs/")) {
    return pathname.slice(3);
  }

  return pathname;
}

export function localeFromPathname(pathname: string): AppLocale {
  if (pathname === EN_PREFIX || pathname.startsWith(`${EN_PREFIX}/`)) {
    return ENGLISH_LOCALE;
  }

  return DEFAULT_LOCALE;
}

export function localizePathname(pathname: string, locale: AppLocale) {
  const normalizedPathname = pathname.startsWith("/")
    ? pathname
    : `/${pathname}`;
  const unprefixed = stripLocalePrefix(normalizedPathname);

  if (locale === ENGLISH_LOCALE) {
    return unprefixed === "/" ? EN_PREFIX : `${EN_PREFIX}${unprefixed}`;
  }

  return unprefixed;
}

export function withLocalizedSearch(pathname: string, search: string) {
  return search ? `${pathname}${search}` : pathname;
}
