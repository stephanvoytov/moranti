/* =============================================
   Moranti — Site content (server-only)
   Читает глобалы Payload «Контент сайта» и
   «Тексты сайта» с кешированием. Используется
   в серверных компонентах витрины.
   ============================================= */

import { getPayload } from "payload";
import config from "@payload-config";
import { cacheGet } from "@/lib/data-cache";
import { richTextToText } from "@/lib/richtext";
import type { SiteStrings } from "@/lib/strings";

interface RawSocial {
  platform?: unknown;
  url?: unknown;
}
interface RawSiteContent {
  footer?: { aboutText?: unknown; copyright?: string };
  contacts?: {
    phone?: string;
    email?: string;
    address?: string;
    city?: string;
    workHours?: string;
  };
  social?: RawSocial[];
  [k: string]: unknown;
}

export interface SiteContentData {
  footer: { aboutText: string; copyright: string };
  contacts: {
    phone: string;
    email: string;
    address: string;
    city: string;
    workHours: string;
  };
  social: { platform: string; url: string }[];
}

const EMPTY: SiteContentData = {
  footer: { aboutText: "", copyright: "" },
  contacts: { phone: "", email: "", address: "", city: "", workHours: "" },
  social: [],
};

export async function getSiteContent(): Promise<SiteContentData> {
  return cacheGet(
    "site-content-global",
    async () => {
      try {
        const payload = await getPayload({ config });
        const doc = (await payload.findGlobal({ slug: "site-content" })) as unknown as RawSiteContent;
        const footer: RawSiteContent["footer"] = doc?.footer ?? {};
        const contacts: RawSiteContent["contacts"] = doc?.contacts ?? {};
        const social = Array.isArray(doc?.social) ? doc.social : [];
        return {
          footer: {
            aboutText: richTextToText(footer.aboutText) || "",
            copyright: footer.copyright || "",
          },
          contacts: {
            phone: contacts.phone || "",
            email: contacts.email || "",
            address: contacts.address || "",
            city: contacts.city || "",
            workHours: contacts.workHours || "",
          },
          social: social.map((s) => ({
            platform: String(s?.platform || ""),
            url: String(s?.url || ""),
          })),
        };
      } catch {
        return EMPTY;
      }
    },
    30_000,
    600_000,
  );
}

export interface PageData {
  title: string;
  slug: string;
  /** Блоки страницы (hero / section / statement / images / cards / cta) */
  layout: unknown[];
}

/**
 * Страница по ЧПУ (коллекция «Страницы»).
 * Возвращает null, если страница не найдена или не опубликована.
 */
export async function getPage(slug: string): Promise<PageData | null> {
  return cacheGet(
    `page-${slug}`,
    async () => {
      try {
        const payload = await getPayload({ config });
        const res = await payload.find({
          collection: "pages",
          where: { slug: { equals: slug } },
          limit: 1,
          overrideAccess: true,
        });
        const doc = res.docs?.[0] as unknown as Record<string, unknown>;
        if (!doc || doc.status !== "published") return null;
        return {
          title: String(doc.title || ""),
          slug: String(doc.slug || slug),
          layout: Array.isArray(doc.layout) ? doc.layout : [],
        };
      } catch {
        return null;
      }
    },
    30_000,
    600_000,
  );
}

/** Плоский текст из блоков (для лидов на функциональных страницах) */
export function layoutToText(layout?: unknown[]): string {
  if (!Array.isArray(layout)) return "";
  const out: string[] = [];
  for (const raw of layout) {
    if (!raw || typeof raw !== "object") continue;
    const b = raw as Record<string, unknown>;
    if (typeof b.text === "string" && b.blockType === "statement") {
      out.push(b.text);
    }
    if (typeof b.subtitle === "string" && b.subtitle) out.push(b.subtitle);
    if (typeof b.paragraphs === "string") out.push(b.paragraphs.trim());
    if (Array.isArray(b.items)) {
      for (const it of b.items) {
        const item = it as { text?: unknown };
        if (item?.text) out.push(String(item.text));
      }
    }
  }
  return out.join(" ");
}

export async function getSiteStrings(): Promise<SiteStrings> {
  return cacheGet(
    "site-strings-global",
    async () => {
      try {
        const payload = await getPayload({ config });
        const doc = (await payload.findGlobal({ slug: "site-strings" })) as unknown as Record<string, unknown>;
        const arr = Array.isArray(doc?.strings) ? doc.strings : [];
        const map: SiteStrings = {};
        for (const s of arr) {
          if (s?.key) map[String(s.key)] = String(s.value ?? "");
        }
        return map;
      } catch {
        return {};
      }
    },
    30_000,
    600_000,
  );
}
