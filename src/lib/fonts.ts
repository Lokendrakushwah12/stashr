import { Geist, Geist_Mono } from "next/font/google";
import localFont from "next/font/local";

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

const displayFont = localFont({
  src: '../../public/fonts/Lastik-Regular.otf',
  variable: '--font-display',
});


export { geistMono, inter, displayFont };