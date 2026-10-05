import type { Metadata, Viewport } from "next";
import { Outfit, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#1F2124",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: "Ember Dust — Pure Wood Ash for Gardeners & Ceramicists",
  description:
    "Small-batch, triple-screened organic wood ash. Natural potassium boost & soil pH correction for lush gardens, plus ultra-fine glaze flux for studio ceramicists.",
  keywords: [
    "wood ash for plants",
    "potassium fertilizer",
    "organic garden ash",
    "ceramic glaze ash",
    "pottery flux",
    "natural pest deterrent",
    "soil pH buffer",
    "hardwood ash India",
  ],
  authors: [{ name: "Ember Dust" }],
  openGraph: {
    title: "Ember Dust — Pure Organic Wood Ash",
    description:
      "Small-batch, 100% pure wood ash for gardeners and ceramic artists. Order directly on WhatsApp with instant delivery tracking.",
    type: "website",
    locale: "en_IN",
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

import { SiteConfigProvider } from "@/context/SiteConfigContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} ${jakarta.variable} antialiased`}
    >
      <head>
        <link
          rel="preload"
          as="image"
          href="/images/sequence/frame_001.webp"
          type="image/webp"
          fetchPriority="high"
        />
      </head>
      <body className="min-h-screen bg-[#F6F2EA] text-[#1F2124] selection:bg-[#B8935A] selection:text-white font-sans">
        <SiteConfigProvider>
          {children}
        </SiteConfigProvider>
      </body>
    </html>
  );
}
