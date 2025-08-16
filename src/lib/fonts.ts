import { Geist, Geist_Mono } from "next/font/google";

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
});

const inter = Geist({
  display: "swap",
  subsets: ["latin"],
  variable: "--font-geist",
});

export { geistMono, inter };