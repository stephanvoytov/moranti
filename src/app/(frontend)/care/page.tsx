import type { Metadata } from "next";
import { seoConfig } from "@/config/seo";
import { buildBreadcrumbJsonLd } from "@/lib/seo-jsonld";
import PageView from "@/components/sections/page-view";

const { title, description } = seoConfig.pages.care;

const siteUrl = process.env.SITE_URL || "http://localhost:3001";

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: "/care",
  },
  openGraph: {
    title: `${title} — Moranti`,
    description,
    url: "/care",
  },
};

export default function CarePage() {
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
                { name: "Уход за сумками", path: "/care" },
              ],
              siteUrl,
            ),
          ),
        }}
      />
      <PageView slug="uxod-za-sumkami" breadcrumbLabel="Уход за сумками" />
    </>
  );
}
