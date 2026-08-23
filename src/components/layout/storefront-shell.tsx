"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import NewsletterPopup from "@/components/layout/newsletter-popup";
import ScrollToTop from "@/components/ui/scroll-to-top-lazy";

/**
 * Wraps storefront chrome (header/footer/popups). On Payload admin (/admin)
 * and API (/api) routes we render children bare so the admin panel isn't
 * wrapped by the storefront layout.
 */
export function StorefrontShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdmin =
    pathname?.startsWith("/admin") || pathname?.startsWith("/api");

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
      <NewsletterPopup />
      <ScrollToTop />
    </>
  );
}
