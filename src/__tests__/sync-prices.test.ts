/**
 * Тесты для wbFetchOfficialPrices — парсинг WB Prices & Discounts API.
 *
 * Покрытие:
 *   ✓ нет apiKey
 *   ✓ парсинг listGoods (цены /100)
 *   ✓ URL и query params (host, path, limit, offset)
 *   ✓ пагинация (offset progression, 2500 → 3 запроса)
 *   ✓ sizes[0] отсутствует, price отсутствует
 *   ✓ 429 rate limit + retry
 *   ✓ 4xx/network error → log.line, не падает
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { wbFetchOfficialPrices } from "../../scripts/sync-modules/prices.mjs";

function makeSpyLog() {
  return {
    write: vi.fn(),
    line: vi.fn(),
    progress: vi.fn(),
    detail: vi.fn(),
  };
}

beforeEach(() => {
  vi.restoreAllMocks();
});

function mockFetch(status, body) {
  globalThis.fetch = vi.fn().mockResolvedValue({
    status,
    ok: status >= 200 && status < 300,
    json: () => Promise.resolve(body),
    text: () => Promise.resolve(typeof body === "string" ? body : JSON.stringify(body)),
  });
}

function priceGood(nmID, priceKop, discountedKop, techSize = "ONE") {
  return {
    nmID,
    vendorCode: `vendor-${nmID}`,
    sizes: [
      {
        sizeID: nmID * 1000 + 1,
        price: priceKop,
        discountedPrice: discountedKop,
        techSizeName: techSize,
      },
    ],
    currencyIsoCode4217: "RUB",
    discount: Math.round((1 - discountedKop / priceKop) * 100),
    clubDiscount: 0,
    editableSizePrice: true,
  };
}

describe("wbFetchOfficialPrices", () => {
  // ─── Нет ключа ───
  it("нет apiKey (null) — возвращает пустой Map", async () => {
    expect((await wbFetchOfficialPrices(null)).size).toBe(0);
  });

  it("нет apiKey (undefined) — возвращает пустой Map", async () => {
    expect((await wbFetchOfficialPrices(undefined)).size).toBe(0);
  });

  // ─── Успешный парсинг ───
  it("парсит ответ с одним товаром — цена /100", async () => {
    mockFetch(200, { data: { listGoods: [priceGood(98486, 50000, 35000)] } });
    const result = await wbFetchOfficialPrices("test-key");
    expect(result.size).toBe(1);
    expect(result.get(98486).price).toBe(500);
    expect(result.get(98486).discountedPrice).toBe(350);
    expect(result.get(98486).stock).toBeNull();
  });

  it("несколько товаров — маппится по nmID", async () => {
    mockFetch(200, {
      data: {
        listGoods: [
          priceGood(111, 100000, 80000),
          priceGood(222, 50000, 45000),
          priceGood(333, 200000, 150000),
        ],
      },
    });
    const result = await wbFetchOfficialPrices("key");
    expect(result.size).toBe(3);
    expect(result.get(111).price).toBe(1000);
    expect(result.get(222).price).toBe(500);
    expect(result.get(333).price).toBe(2000);
  });

  // ─── Копейки ───
  it("деление на 100: 100 копеек → 1 рубль", async () => {
    mockFetch(200, { data: { listGoods: [priceGood(1, 100, 99)] } });
    const result = await wbFetchOfficialPrices("key");
    expect(result.get(1).price).toBe(1);
    expect(result.get(1).discountedPrice).toBe(0.99);
  });

  it("большое число копеек: 999999 → 9999.99", async () => {
    mockFetch(200, { data: { listGoods: [priceGood(1, 999999, 888888)] } });
    const result = await wbFetchOfficialPrices("key");
    expect(result.get(1).price).toBe(9999.99);
    expect(result.get(1).discountedPrice).toBe(8888.88);
  });

  // ─── URL и query params ───
  it("GET запрос на правильный URL с limit и offset", async () => {
    mockFetch(200, { data: { listGoods: [] } });
    await wbFetchOfficialPrices("my-token");

    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
    const [url, init] = globalThis.fetch.mock.calls[0];
    expect(url).toMatch(/^https:\/\/discounts-prices-api\.wildberries\.ru\/api\/v2\/list\/goods\/filter/);
    expect(new URL(url).searchParams.get("limit")).toBe("1000");
    expect(new URL(url).searchParams.get("offset")).toBe("0");
    // method не указан → undefined = GET по умолчанию
    expect(init.method ?? "GET").toBe("GET");
    expect(init.headers.Authorization).toBe("my-token");
  });

  // ─── Пропуск товаров без sizes ───
  it("товар без sizes[0] — пропускается", async () => {
    mockFetch(200, {
      data: {
        listGoods: [
          { nmID: 1, sizes: [] },
          priceGood(2, 10000, 8000),
        ],
      },
    });
    const result = await wbFetchOfficialPrices("key");
    expect(result.size).toBe(1);
    expect(result.has(1)).toBe(false);
    expect(result.has(2)).toBe(true);
  });

  it("sizes[0] без price — пропускается", async () => {
    mockFetch(200, {
      data: {
        listGoods: [
          { nmID: 1, sizes: [{ sizeID: 1, techSizeName: "ONE" }] },
          priceGood(2, 10000, 8000),
        ],
      },
    });
    const result = await wbFetchOfficialPrices("key");
    expect(result.size).toBe(1);
    expect(result.has(2)).toBe(true);
  });

  // ─── Пустой ответ ───
  it("пустой listGoods — пагинация завершается", async () => {
    mockFetch(200, { data: { listGoods: [] } });
    expect((await wbFetchOfficialPrices("key")).size).toBe(0);
  });

  it("data отсутствует — пустой результат", async () => {
    mockFetch(200, {});
    expect((await wbFetchOfficialPrices("key")).size).toBe(0);
  });

  it("data.listGoods отсутствует — пустой результат", async () => {
    mockFetch(200, { data: {} });
    expect((await wbFetchOfficialPrices("key")).size).toBe(0);
  });

  // ─── Пагинация ───
  it("пагинация: 2500 товаров → 3 запроса, offset: 0→1000→2000", async () => {
    const capturedUrls = [];
    globalThis.fetch = vi.fn().mockImplementation((url) => {
      capturedUrls.push(url);
      const offset = parseInt(new URL(url).searchParams.get("offset") || "0", 10);
      const remaining = 2500 - offset;
      const count = Math.min(remaining, 1000);
      const goods = Array.from({ length: count }, (_, i) => priceGood(offset + i + 1, 50000, 40000));
      return Promise.resolve({
        status: 200,
        ok: true,
        json: () => Promise.resolve({ data: { listGoods: goods } }),
      });
    });

    const result = await wbFetchOfficialPrices("key");
    expect(globalThis.fetch).toHaveBeenCalledTimes(3);
    expect(result.size).toBe(2500);

    const offsets = capturedUrls.map((u) => new URL(u).searchParams.get("offset"));
    expect(offsets).toEqual(["0", "1000", "2000"]);
  });

  it("пагинация: ровно 1000 товаров → 1 запрос", async () => {
    // Возвращаем 1000 на первый запрос, пустой на второй (чтобы выйти из while)
    globalThis.fetch = vi
      .fn()
      .mockResolvedValueOnce({
        status: 200, ok: true,
        json: () =>
          Promise.resolve({
            data: {
              listGoods: Array.from({ length: 1000 }, (_, i) => priceGood(i + 1, 10000, 8000)),
            },
          }),
      })
      .mockResolvedValueOnce({
        status: 200, ok: true,
        json: () => Promise.resolve({ data: { listGoods: [] } }),
      });
    expect((await wbFetchOfficialPrices("key")).size).toBe(1000);
    expect(globalThis.fetch).toHaveBeenCalledTimes(2); // второй запрос заканчивает пагинацию
  });

  it("пагинация: 1 товар → 1 запрос", async () => {
    mockFetch(200, { data: { listGoods: [priceGood(1, 10000, 8000)] } });
    const result = await wbFetchOfficialPrices("key");
    expect(result.size).toBe(1);
    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
  });

  // ─── Rate limit 429 ───
  it("429 rate limit — retry 1s", async () => {
    globalThis.fetch = vi
      .fn()
      .mockResolvedValueOnce({ status: 429, ok: false, text: () => Promise.resolve("too many") })
      .mockResolvedValueOnce({
        status: 200, ok: true,
        json: () => Promise.resolve({ data: { listGoods: [priceGood(1, 10000, 8000)] } }),
      });

    vi.useFakeTimers();
    const promise = wbFetchOfficialPrices("key");
    await vi.advanceTimersByTimeAsync(1000);
    const result = await promise;
    vi.useRealTimers();

    expect(result.size).toBe(1);
    expect(globalThis.fetch).toHaveBeenCalledTimes(2);
  });

  // ─── Ошибки ───
  it("4xx ошибка — log.line с кодом, не падает", async () => {
    mockFetch(401, { error: true, errorText: "Unauthorized" });
    const log = makeSpyLog();

    const result = await wbFetchOfficialPrices("bad-key", log);
    expect(result.size).toBe(0);
    expect(log.line).toHaveBeenCalledWith(expect.stringContaining("401"));
    expect(log.line.mock.calls[0][0]).toMatch(/Official prices API 401/);
  });

  it("network error — log.line с сообщением, не падает", async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new Error("Network error"));
    const log = makeSpyLog();

    const result = await wbFetchOfficialPrices("key", log);
    expect(result.size).toBe(0);
    expect(log.line).toHaveBeenCalledWith(expect.stringContaining("Network error"));
    expect(log.line.mock.calls[0][0]).toMatch(/Official prices API error/);
  });
});
