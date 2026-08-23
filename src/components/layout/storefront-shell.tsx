"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import NewsletterPopup from "@/components/layout/newsletter-popup";
import ScrollToTop from "@/components/ui/scroll-to-top-lazy";
import type { SiteContentData } from "@/lib/site-content";
import type { SiteStrings } from "@/lib/strings";

/**
 * Wraps storefront chrome (header/footer/popups). On Payload admin (/admin)
 * and API (/api) routes we render children bare so the admin panel isn't
 * wrapped by the storefront layout.
 */
export function StorefrontShell({
  children,
  siteContent,
  strings,
}: {
  children: React.ReactNode;
  siteContent: SiteContentData;
  strings: SiteStrings;
}) {
  const pathname = usePathname();
  const isAdmin =
    pathname?.startsWith("/admin") || pathname?.startsWith("/api");

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <>
      <Header strings={strings} />
      <main>{children}</main>
      <Footer siteContent={siteContent} />
      <NewsletterPopup />
      <ScrollToTop />
    </>
  );
}
