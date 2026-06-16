import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* ─── Turbopack root (fixes lockfile warning) ─── */
  turbopack: {
    root: process.cwd(),
  },

  /* ─── Image optimization (ready for real photos) ─── */
  images: {
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
