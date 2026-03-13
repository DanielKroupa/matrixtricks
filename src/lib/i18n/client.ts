"use client";

import { usePathname } from "next/navigation";
import { getMessages } from "@/lib/i18n/messages";
import { localeFromPathname, localizePathname } from "@/lib/i18n/routing";

export function useI18n() {
  const pathname = usePathname();
  const locale = localeFromPathname(pathname || "/");
  const dictionary = getMessages(locale);

  const localizeHref = (path: string) => localizePathname(path, locale);

  return {
    locale,
    pathname,
    dictionary,
    localizeHref,
  };
}
