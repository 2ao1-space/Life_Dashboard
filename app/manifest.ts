import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "حياتي",
    short_name: "حياتي",
    description: "تطبيق إدارة الحياة الشخصية اليومية",
    start_url: "/",
    display: "standalone",
    background_color: "#FAFAF8",
    theme_color: "#2F6F5E",
    dir: "rtl",
    lang: "ar",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
