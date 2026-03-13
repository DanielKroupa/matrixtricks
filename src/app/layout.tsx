import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { LoginModal } from "@/components/auth/LoginModal";
import UserChatWidget from "@/components/chat/UserChatWidget";
import DevBreakpointBadgeClient from "@/components/ui/DevBreakpointBadgeClient";
import { AuthProvider } from "@/hooks/AuthContext";
import { PresenceProvider } from "@/hooks/PresenceContext";
import { getServerSession } from "@/lib/get-session";
import { getMessages } from "@/lib/i18n/messages";
import { getRequestLocale } from "@/lib/i18n/server";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const fallbackSiteUrl = "https://www.matrixtricks.com";

function getMetadataBase() {
  const rawUrl =
    process.env.NEXT_PUBLIC_APP_URL ??
    process.env.BETTER_AUTH_URL ??
    fallbackSiteUrl;

  try {
    return new URL(rawUrl);
  } catch {
    return new URL(fallbackSiteUrl);
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const metadataMessages = getMessages(locale).metadata;

  return {
    metadataBase: getMetadataBase(),
    title: metadataMessages.title,
    description: metadataMessages.description,
    alternates: {
      canonical: locale === "en" ? "/en" : "/",
      languages: {
        "cs-CZ": "/",
        "en-GB": "/en",
      },
    },
    openGraph: {
      type: "website",
      siteName: "Matrix Tricks",
      title: metadataMessages.title,
      description: metadataMessages.description,
      url: locale === "en" ? "/en" : "/",
      images: [
        {
          url: "/logos/matrix-tricks.png",
          width: 512,
          height: 512,
          alt: "Matrix Tricks",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: metadataMessages.title,
      description: metadataMessages.description,
      images: ["/logos/matrix-tricks.png"],
    },
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getRequestLocale();
  const session = await getServerSession();
  const userId = session?.user?.id ?? null;
  const initialVisibilityEnabled = session?.user?.onlineVisibility ?? true;

  return (
    <html suppressHydrationWarning lang={locale}>
      <body className={`${poppins.variable} mx-auto antialiased xl:container`}>
        <AuthProvider>
          <PresenceProvider
            userId={userId}
            initialVisibilityEnabled={initialVisibilityEnabled}
          >
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
              {children}
              <UserChatWidget userId={userId} userRole={session?.user?.role} />
            </ThemeProvider>
          </PresenceProvider>
          <DevBreakpointBadgeClient />
          <LoginModal />
        </AuthProvider>
      </body>
    </html>
  );
}
