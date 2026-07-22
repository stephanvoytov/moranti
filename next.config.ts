import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* ─── Include sync bundle in API routes (Vercel file tracing) ─── */
  outputFileTracingIncludes: {
    "/api/admin/sync": ["./scripts/sync-all.bundle.mjs"],
    "/api/admin/sync/*": ["./scripts/sync-all.bundle.mjs"],
  },

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

  /* ─── Static security headers ─── */
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value:
              "camera=(), microphone=(), geolocation=(), interest-cohort=(), " +
              "payment=(), usb=(), bluetooth=(), midi=(), sync-xhr=(), " +
              "accelerometer=(), gyroscope=(), magnetometer=(), ambient-light-sensor=()",
          },
        ],
      },
      {
        source: "/_next/static/media/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
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
