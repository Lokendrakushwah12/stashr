import { ThemeProvider } from "@/components/layouts/theme-provider";
import { QueryProvider } from "@/components/providers/query-provider";
import AuthSessionProvider from "@/components/providers/session-provider";
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import "@/styles/globals.css";
import { type Metadata } from "next";
import { Toaster } from "sonner";
import { displayFont } from "@/lib/fonts";

export const metadata: Metadata = {
  title: "Stashr - Turn scattered inspiration into organized thinking",
  description: " Stashr is where ideas take shape—before they become projects. Collect links, cluster concepts, and collaborate on Boards that evolve into actionable plans.",
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
    title: "Stashr - Turn scattered inspiration into organized thinking",
    description: "Stashr is where ideas take shape—before they become projects. Collect links, cluster concepts, and collaborate on Boards that evolve into actionable plans.",
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
    title: "Stashr - Turn scattered inspiration into organized thinking",
    description: "Stashr is where ideas take shape—before they become projects. Collect links, cluster concepts, and collaborate on Boards that evolve into actionable plans.",
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
      suppressHydrationWarning
    >
      <body
        className={`${GeistSans.variable} ${GeistMono.variable} ${displayFont.variable} font-sans antialiased`}
      >
        <AuthSessionProvider>
          <QueryProvider>
            <ThemeProvider>
              {children}
              <Toaster />
            </ThemeProvider>
          </QueryProvider>
        </AuthSessionProvider>
      </body>
    </html>
  );
}
