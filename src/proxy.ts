import { type NextRequest, NextResponse } from "next/server";
import {
  DEFAULT_LOCALE,
  ENGLISH_LOCALE,
  isAppLocale,
  LOCALE_COOKIE_NAME,
} from "@/lib/i18n/config";
import {
  localeFromPathname,
  localizePathname,
  stripLocalePrefix,
} from "@/lib/i18n/routing";

function withLocaleHeader(request: NextRequest, locale: string) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-locale", locale);
  return requestHeaders;
}

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const searchValue = search ?? "";

  const pathnameLocale = localeFromPathname(pathname);
  const cookieLocaleValue = request.cookies.get(LOCALE_COOKIE_NAME)?.value;
  const cookieLocale = isAppLocale(cookieLocaleValue)
    ? cookieLocaleValue
    : DEFAULT_LOCALE;

  if (pathname === "/cs" || pathname.startsWith("/cs/")) {
    const targetPath = stripLocalePrefix(pathname);
    const redirectUrl = new URL(`${targetPath}${searchValue}`, request.url);
    const response = NextResponse.redirect(redirectUrl);
    response.cookies.set(LOCALE_COOKIE_NAME, DEFAULT_LOCALE, {
      path: "/",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365,
    });
    return response;
  }

  if (pathnameLocale === ENGLISH_LOCALE) {
    const rewrittenPathname = stripLocalePrefix(pathname);
    const rewriteUrl = new URL(
      `${rewrittenPathname}${searchValue}`,
      request.url,
    );
    const response = NextResponse.rewrite(rewriteUrl, {
      request: {
        headers: withLocaleHeader(request, ENGLISH_LOCALE),
      },
    });

    response.cookies.set(LOCALE_COOKIE_NAME, ENGLISH_LOCALE, {
      path: "/",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365,
    });
    return response;
  }

  if (
    cookieLocale === ENGLISH_LOCALE &&
    request.method === "GET" &&
    !pathname.startsWith("/api")
  ) {
    const localizedPath = localizePathname(pathname, ENGLISH_LOCALE);
    const redirectUrl = new URL(`${localizedPath}${searchValue}`, request.url);

    const response = NextResponse.redirect(redirectUrl);
    response.cookies.set(LOCALE_COOKIE_NAME, ENGLISH_LOCALE, {
      path: "/",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365,
    });
    return response;
  }

  const response = NextResponse.next({
    request: {
      headers: withLocaleHeader(request, DEFAULT_LOCALE),
    },
  });

  response.cookies.set(LOCALE_COOKIE_NAME, DEFAULT_LOCALE, {
    path: "/",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
  });

  return response;
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\..*).*)",
  ],
};
