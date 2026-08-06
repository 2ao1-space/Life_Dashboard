// next.config.js
const withPWA = require("next-pwa")({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,

  // ✅ Cache كل حاجة عشان يشتغل offline
  runtimeCaching: [
    // 1. الصفحات — network first, fallback to cache
    {
      urlPattern: /^https:\/\/.+\/(dashboard|auth)?(\?.*)?$/,
      handler: "NetworkFirst",
      options: {
        cacheName: "pages-cache",
        expiration: { maxEntries: 10, maxAgeSeconds: 7 * 24 * 60 * 60 },
        networkTimeoutSeconds: 10,
      },
    },
    // 2. الـ JS/CSS/fonts — stale while revalidate
    {
      urlPattern: /\/_next\/static\/.*/,
      handler: "CacheFirst",
      options: {
        cacheName: "next-static",
        expiration: { maxEntries: 200, maxAgeSeconds: 30 * 24 * 60 * 60 },
      },
    },
    // 3. الصور
    {
      urlPattern: /\.(png|jpg|jpeg|svg|ico|webp)$/,
      handler: "CacheFirst",
      options: {
        cacheName: "images-cache",
        expiration: { maxEntries: 50, maxAgeSeconds: 30 * 24 * 60 * 60 },
      },
    },
    // 4. Google Fonts
    {
      urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/,
      handler: "CacheFirst",
      options: {
        cacheName: "fonts-cache",
        expiration: { maxEntries: 20, maxAgeSeconds: 365 * 24 * 60 * 60 },
      },
    },
  ],

  // ✅ لو مفيش نت ومفيش cache — اعرض صفحة offline
  fallbacks: {
    document: "/offline",
  },
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
};

module.exports = withPWA(nextConfig);
