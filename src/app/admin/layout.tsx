import type { Metadata } from "next";
import { seoConfig } from "@/config/seo";

export const metadata: Metadata = {
  robots: seoConfig.pages.admin.noindex
    ? { index: false, follow: false }
    : undefined,
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
