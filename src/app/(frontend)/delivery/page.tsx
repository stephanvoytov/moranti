import type { Metadata } from "next";
import { seoConfig } from "@/config/seo";
import { buildBreadcrumbJsonLd } from "@/lib/seo-jsonld";
import PageView from "@/components/sections/page-view";

const { title, description } = seoConfig.pages.delivery;

const siteUrl = process.env.SITE_URL || "http://localhost:3001";

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: "/delivery",
  },
  openGraph: {
    title: `${title} — Moranti`,
    description,
    url: "/delivery",
  },
};

export default function DeliveryPage() {
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
                { name: "Доставка", path: "/delivery" },
              ],
              siteUrl,
            ),
          ),
        }}
      />
      <PageView slug="dostavka-i-oplata" breadcrumbLabel="Доставка" />
    </>
  );
}
