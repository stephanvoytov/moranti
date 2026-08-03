import { describe, it, expect } from "vitest";
import { blobUrl, isBlobUrl } from "@/lib/blob";

describe("blobUrl", () => {
  const blob =
    "https://myshr8bhorjsndix.public.blob.vercel-storage.com/media/1785693763227-31bv-nzlEz6SWzpY4tD2uNnF7IgA3Fdg5C0.png";

  it("blob-URL переписывается в прокси своего домена", () => {
    expect(blobUrl(blob)).toBe(
      "/api/blob/myshr8bhorjsndix/media/1785693763227-31bv-nzlEz6SWzpY4tD2uNnF7IgA3Fdg5C0.png",
    );
  });

  it("локальные URL (/images/...) не трогаются", () => {
    expect(blobUrl("/images/hero.png")).toBe("/images/hero.png");
  });

  it("WB CDN не проксируется", () => {
    const wb = "https://basket-01.wbbasket.ru/vol1234/part56789/123456789/images/big/1.webp";
    expect(blobUrl(wb)).toBe(wb);
  });

  it("Ozon CDN не проксируется", () => {
    const ozon = "https://ir.ozone.ru/s3/multimedia-1-c/1234567890.jpg";
    expect(blobUrl(ozon)).toBe(ozon);
  });

  it("пустая строка возвращается как есть", () => {
    expect(blobUrl("")).toBe("");
  });
});

describe("isBlobUrl", () => {
  it("распознаёт blob-URL", () => {
    expect(isBlobUrl("https://abc.public.blob.vercel-storage.com/x/y.png")).toBe(true);
  });

  it("не распознаёт WB/Ozon/локальные URL", () => {
    expect(isBlobUrl("https://basket-01.wbbasket.ru/vol/1.webp")).toBe(false);
    expect(isBlobUrl("https://www.ozone.ru/s3/1.jpg")).toBe(false);
    expect(isBlobUrl("/images/hero.png")).toBe(false);
  });
});