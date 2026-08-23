import type { Metadata } from "next";
import { seoConfig } from "@/config/seo";
import { buildBreadcrumbJsonLd } from "@/lib/seo-jsonld";
import PageView from "@/components/sections/page-view";

const { title, description } = seoConfig.pages.about;

const siteUrl = process.env.SITE_URL || "http://localhost:3001";

export const revalidate = 3600;

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    title: `${title} — Moranti`,
    description,
    url: "/about",
  },
};

export default function AboutPage() {
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
                { name: "О бренде", path: "/about" },
              ],
              siteUrl,
            ),
          ),
        }}
      />
      <PageView slug="o-nas" breadcrumbLabel="О бренде" />
    </>
  );
}
