import type { NextConfig } from "next";

// ⚠️ Vercel force-rewrites schema.prisma datasource URL to env("DATABASE_URL")
//    (via "Applying modifyConfig from Vercel" build step).
//    Supabase injection provides POSTGRES_PRISMA_URL but NOT DATABASE_URL.
//    Bridge: set DATABASE_URL from what Supabase actually injects.
if (!process.env.DATABASE_URL && process.env.POSTGRES_PRISMA_URL) {
  process.env.DATABASE_URL = process.env.POSTGRES_PRISMA_URL;
}

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
