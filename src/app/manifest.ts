import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Ember Dust — Pure Wood Ash",
    short_name: "Ember Dust",
    description:
      "Organic wood ash for soil health, potassium fertilization, and studio pottery glaze flux.",
    start_url: "/",
    display: "standalone",
    background_color: "#EDE6DA",
    theme_color: "#1F2124",
    icons: [
      {
        src: "/favicon-32x32.png",
        sizes: "32x32",
        type: "image/png",
      },
      {
        src: "/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
    shortcuts: [
      {
        name: "Order on WhatsApp",
        url: "/#calculator",
        description: "Open instant price calculator and order on WhatsApp",
      },
      {
        name: "View Catalog",
        url: "/#products",
        description: "Explore all pure wood ash blends and laboratory specs",
      },
    ],
  };
}
