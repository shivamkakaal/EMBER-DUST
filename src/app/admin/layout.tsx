import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "Ember Dust Admin — Operations HQ",
  description: "Live order tracking, stock manager, and storefront configuration",
  manifest: "/admin/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Ember Admin",
  },
  icons: {
    icon: "/favicon-32x32.png",
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#181A1D",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <link rel="manifest" href="/admin-manifest.json" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      <meta name="apple-mobile-web-app-title" content="Ember Admin" />
      {children}
    </>
  );
}
