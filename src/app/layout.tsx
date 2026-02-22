// biome-ignore assist/source/organizeImports: <explanation>
import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { PresenceProvider } from "@/context/PresenceContext";
import { LoginModal } from "./components/authLayout/LoginModal";
import { ThemeProvider } from "next-themes";
import DevBreakpointBadgeClient from "./components/ui/DevBreakpointBadgeClient";
import { getServerSession } from "@/lib/get-session";
import UserChatWidget from "./components/chat/UserChatWidget";

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

export const metadata: Metadata = {
  metadataBase: getMetadataBase(),
  title: "Matrix Tricks",
  description:
    "Matrix Tricks je social platforma s videi, texty a triky zaměřenými na komunitní obsah.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    siteName: "Matrix Tricks",
    title: "Matrix Tricks",
    description:
      "Matrix Tricks je social platforma s videi, texty a triky zaměřenými na komunitní obsah.",
    url: "/",
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
    title: "Matrix Tricks",
    description:
      "Matrix Tricks je social platforma s videi, texty a triky zaměřenými na komunitní obsah.",
    images: ["/logos/matrix-tricks.png"],
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();
  const userId = session?.user?.id ?? null;
  const initialVisibilityEnabled = session?.user?.onlineVisibility ?? true;

  return (
    <html suppressHydrationWarning lang="en">
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
