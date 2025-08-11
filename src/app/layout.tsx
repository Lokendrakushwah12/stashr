import { ThemeProvider } from "@/components/layouts/theme-provider";
import AuthSessionProvider from "@/components/providers/session-provider";
import { QueryProvider } from "@/components/providers/query-provider";
import { cn } from "@/lib/utils";
import "@/styles/globals.css";
import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "Stashr - Organize Your Bookmarks",
  description: "Organize your web bookmarks into colorful folders with an intuitive interface. Fast, beautiful, and secure bookmark management built with Next.js.",
  keywords: ["bookmarks", "organizer", "web", "folders", "management", "nextjs", "typescript"],
  authors: [{ name: "Lokendra" }],
  creator: "Lokendra",
  publisher: "Stashr",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://stashr.in"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://stashr.in",
    title: "Stashr - Organize Your Bookmarks",
    description: "Organize your web bookmarks into colorful folders with an intuitive interface. Fast, beautiful, and secure bookmark management.",
    siteName: "Stashr",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "Stashr - Organize Your Bookmarks",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Stashr - Organize Your Bookmarks",
    description: "Organize your web bookmarks into colorful folders with an intuitive interface. Fast, beautiful, and secure bookmark management.",
    images: ["/og.png"],
    creator: "@lokendratwt",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    shortcut: ["/favicon.ico"],
  },
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${GeistSans.variable}`}
      suppressHydrationWarning
    >
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          GeistSans.variable,
        )}
      >
        <AuthSessionProvider>
          <QueryProvider>
            <ThemeProvider>{children}</ThemeProvider>
          </QueryProvider>
        </AuthSessionProvider>
      </body>
    </html>
  );
}
