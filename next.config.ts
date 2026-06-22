import type { NextConfig } from "next";

// ⚠️ Vercel force-rewrites schema.prisma datasource URL to env("DATABASE_URL")
//    (via "Applying modifyConfig from Vercel" build step).
//    Supabase injection provides POSTGRES_PRISMA_URL but NOT DATABASE_URL.
//    Bridge: set DATABASE_URL from what Supabase actually injects.
if (!process.env.DATABASE_URL && process.env.POSTGRES_PRISMA_URL) {
  process.env.DATABASE_URL = process.env.POSTGRES_PRISMA_URL;
}

const nextConfig: NextConfig = {
  /* ─── Remove X-Powered-By: Next.js header ─── */
  poweredByHeader: false,

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

  /* ─── Static security headers (applied to all routes) ───
       Note: CSP, X-Frame-Options, etc. are set dynamically in proxy.ts
       for nonce generation. These are additional static headers. ─── */
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // Prevent MIME-sniffing
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Clickjacking protection (frame-ancestors не работает в meta CSP)
          { key: "X-Frame-Options", value: "DENY" },
          // Referrer policy for user privacy
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // Permissions Policy — отключаем ненужные API
          {
            key: "Permissions-Policy",
            value:
              "camera=(), microphone=(), geolocation=(), interest-cohort=(), " +
              "payment=(), usb=(), bluetooth=(), midi=(), sync-xhr=(), " +
              "accelerometer=(), gyroscope=(), magnetometer=(), ambient-light-sensor=()",
          },
        ],
      },
      // Allow fonts to be cached aggressively
      {
        source: "/_next/static/media/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      // Allow static images to be cached
      {
        source: "/images/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, stale-while-revalidate=604800",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
