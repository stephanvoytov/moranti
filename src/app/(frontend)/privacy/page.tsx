import type { Metadata } from "next";
import { seoConfig } from "@/config/seo";
import { buildBreadcrumbJsonLd } from "@/lib/seo-jsonld";
import PageView from "@/components/sections/page-view";

const { title, description } = seoConfig.pages.privacy;

const siteUrl = process.env.SITE_URL || "http://localhost:3001";

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: "/privacy",
  },
  openGraph: {
    title: `${title} — Moranti`,
    description,
    url: "/privacy",
  },
};

export default function PrivacyPage() {
  return (
    <>
      {/* BreadcrumbList JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            buildBreadcrumbJsonLd(
              [
                { name: "Главная", path: "/" },
                { name: "Политика конфиденциальности", path: "/privacy" },
              ],
              siteUrl,
            ),
          ),
        }}
      />
      <PageView
        slug="politika-konfidencialnosti"
        breadcrumbLabel="Политика конфиденциальности"
      />
    </>
  );
}
