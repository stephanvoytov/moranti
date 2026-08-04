import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* ─── Prisma имеет динамические require(), Turbopack не умеет их бандлить ─── */
  serverExternalPackages: [
    "@prisma/client",
    "@prisma/adapter-pg",
    "got-scraping",
    "http2-wrapper",
    // patchright: coreBundle.js требует chromium-bidi (не установлен),
    // Turbopack не может его заинлайнить — держим внешним, как got-scraping
    "patchright",
    "patchright-core",
  ],

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

  /* ─── Ограничение воркеров сборки ───
     На Windows массовый спавн V8-воркеров (по числу ядер) падает в
     "Committing semi space failed" — нехватка commit-чарджа, а не RAM.
     cpus: 2 — стабильно и на локали, и на Vercel. */
  experimental: {
    cpus: 2,
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
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
    ],
  },

  /* ─── 301-редиректы старых slug (из внутреннего артикула) на новые SEO-слаги.
     Карта генерируется скриптом scripts/migrate-slugs.mjs --apply. ─── */
  async redirects() {
    const fs = await import("node:fs");
    const path = await import("node:path");
    const file = path.join(process.cwd(), "data", "slug-redirects.json");

    let map: Record<string, string> = {};
    try {
      map = JSON.parse(fs.readFileSync(file, "utf8"));
    } catch {
      map = {};
    }

    return Object.entries(map).map(([from, to]) => ({
      source: `/catalog/${from}`,
      destination: `/catalog/${to}`,
      permanent: true,
    }));
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
