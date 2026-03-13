import { cookies, headers } from "next/headers";
import {
  type AppLocale,
  DEFAULT_LOCALE,
  isAppLocale,
  LOCALE_COOKIE_NAME,
} from "@/lib/i18n/config";

export async function getRequestLocale(): Promise<AppLocale> {
  const requestHeaders = await headers();
  const headerLocale = requestHeaders.get("x-locale");

  if (isAppLocale(headerLocale)) {
    return headerLocale;
  }

  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get(LOCALE_COOKIE_NAME)?.value;

  if (isAppLocale(cookieLocale)) {
    return cookieLocale;
  }

  return DEFAULT_LOCALE;
}
