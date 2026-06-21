import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* ─── Turbopack root (fixes lockfile warning) ─── */
  turbopack: {
    root: process.cwd(),
  },

  /* ─── Image optimization ─── */
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.wbbasket.ru",
      },
      {
        protocol: "https",
        hostname: "**.geobasket.ru",
      },
    ],
  },
};

export default nextConfig;
