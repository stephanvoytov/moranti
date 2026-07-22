/**
 * Тесты для wbFetchOfficialPrices — WB Prices API через SDK.
 *
 * Покрытие:
 *   ✓ нет apiKey
 *   ✓ парсинг listGoods (цены /100)
 *   ✓ пагинация (offset progression, 2500 → 3 запроса через SDK)
 *   ✓ sizes[0] отсутствует, price отсутствует
 *   ✓ SDK ошибка → log.line, не падает
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { wbFetchOfficialPrices } from "../../scripts/sync-modules/prices.mjs";

// ─── Mock SDK ───
const mockGetGoodsFilter = vi.fn();
const mockSDKConstructor = vi.fn();

vi.mock("daytona-wildberries-typescript-sdk", () => {
  class MockWildberriesSDK {
    products: { getGoodsFilter: typeof mockGetGoodsFilter };
    constructor(config: any) {
      mockSDKConstructor(config);
      this.products = {
        getGoodsFilter: mockGetGoodsFilter,
      };
    }
  }

  return {
    WildberriesSDK: MockWildberriesSDK,
    RateLimitError: class RateLimitError extends Error {
      retryAfter: any;
      constructor(msg: any, retryAfter: any) {
        super(msg);
        this.retryAfter = retryAfter;
      }
    },
    AuthenticationError: class AuthenticationError extends Error {},
    NetworkError: class NetworkError extends Error {},
  };
});

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
  mockGetGoodsFilter.mockReset();
});

function priceGood(nmID: number, priceKop: number, discountedKop: number, techSize = "ONE") {
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
    expect((await wbFetchOfficialPrices(null as any)).size).toBe(0);
  });

  it("нет apiKey (undefined) — возвращает пустой Map", async () => {
    expect((await wbFetchOfficialPrices(undefined as any)).size).toBe(0);
  });

  // ─── Успешный парсинг ───
  it("парсит ответ с одним товаром — цена /100", async () => {
    mockGetGoodsFilter.mockResolvedValue({
      data: { listGoods: [priceGood(98486, 50000, 35000)] },
    });

    const result = await wbFetchOfficialPrices("test-key");
    expect(result.size).toBe(1);
    expect(result.get(98486)!).toBeDefined();
    expect(result.get(98486)!.price).toBe(500);
    expect(result.get(98486)!.discountedPrice).toBe(350);
    expect(result.get(98486)!).not.toHaveProperty("stock");
  });

  it("несколько товаров — маппится по nmID", async () => {
    mockGetGoodsFilter.mockResolvedValue({
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
    expect(result.get(111)!.price).toBe(1000);
    expect(result.get(222)!.price).toBe(500);
    expect(result.get(333)!.price).toBe(2000);
  });

  // ─── Копейки ───
  it("деление на 100: 100 копеек → 1 рубль", async () => {
    mockGetGoodsFilter.mockResolvedValue({
      data: { listGoods: [priceGood(1, 100, 99)] },
    });
    const result = await wbFetchOfficialPrices("key");
    expect(result.get(1)!.price).toBe(1);
    expect(result.get(1)!.discountedPrice).toBe(0.99);
  });

  it("большое число копеек: 999999 → 9999.99", async () => {
    mockGetGoodsFilter.mockResolvedValue({
      data: { listGoods: [priceGood(1, 999999, 888888)] },
    });
    const result = await wbFetchOfficialPrices("key");
    expect(result.get(1)!.price).toBe(9999.99);
    expect(result.get(1)!.discountedPrice).toBe(8888.88);
  });

  // ─── SDK вызывается с правильными параметрами ───
  it("передаёт limit и offset в SDK", async () => {
    mockGetGoodsFilter.mockResolvedValue({ data: { listGoods: [] } });
    await wbFetchOfficialPrices("my-token");

    expect(mockGetGoodsFilter).toHaveBeenCalledTimes(1);
    expect(mockGetGoodsFilter).toHaveBeenCalledWith({
      limit: 1000,
      offset: 0,
    });
  });

  it("передаёт apiKey в конструктор SDK", async () => {
    mockGetGoodsFilter.mockResolvedValue({ data: { listGoods: [] } });

    await wbFetchOfficialPrices("custom-api-key");

    expect(mockSDKConstructor).toHaveBeenCalledWith(
      expect.objectContaining({ apiKey: "custom-api-key" })
    );
  });

  // ─── Пропуск товаров без sizes ───
  it("товар без sizes[0] — пропускается", async () => {
    mockGetGoodsFilter.mockResolvedValue({
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
    mockGetGoodsFilter.mockResolvedValue({
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
  it("пустой listGoods — пагинация завершается (один вызов SDK)", async () => {
    mockGetGoodsFilter.mockResolvedValue({ data: { listGoods: [] } });
    expect((await wbFetchOfficialPrices("key")).size).toBe(0);
    expect(mockGetGoodsFilter).toHaveBeenCalledTimes(1);
  });

  it("data отсутствует — пустой результат", async () => {
    mockGetGoodsFilter.mockResolvedValue({});
    expect((await wbFetchOfficialPrices("key")).size).toBe(0);
  });

  it("data.listGoods отсутствует — пустой результат", async () => {
    mockGetGoodsFilter.mockResolvedValue({ data: {} });
    expect((await wbFetchOfficialPrices("key")).size).toBe(0);
  });

  // ─── Пагинация ───
  it("пагинация: 2500 товаров → 3 запроса к SDK, offset: 0→1000→2000", async () => {
    const capturedParams: any[] = [];
    mockGetGoodsFilter.mockImplementation((params) => {
      capturedParams.push({ ...params });
      const offset = params.offset || 0;
      const remaining = 2500 - offset;
      const count = Math.min(remaining, 1000);
      const goods = Array.from({ length: count }, (_, i) =>
        priceGood(offset + i + 1, 50000, 40000)
      );
      return Promise.resolve({ data: { listGoods: goods } });
    });

    const result = await wbFetchOfficialPrices("key");
    expect(mockGetGoodsFilter).toHaveBeenCalledTimes(3);
    expect(result.size).toBe(2500);

    expect(capturedParams[0]).toEqual({ limit: 1000, offset: 0 });
    expect(capturedParams[1]).toEqual({ limit: 1000, offset: 1000 });
    expect(capturedParams[2]).toEqual({ limit: 1000, offset: 2000 });
  });

  it("пагинация: ровно 1000 товаров → 1 запрос (второй с пустым ответом)", async () => {
    mockGetGoodsFilter
      .mockResolvedValueOnce({
        data: {
          listGoods: Array.from({ length: 1000 }, (_, i) =>
            priceGood(i + 1, 10000, 8000)
          ),
        },
      })
      .mockResolvedValueOnce({ data: { listGoods: [] } });

    expect((await wbFetchOfficialPrices("key")).size).toBe(1000);
    expect(mockGetGoodsFilter).toHaveBeenCalledTimes(2);
  });

  it("пагинация: 1 товар → 1 запрос", async () => {
    mockGetGoodsFilter.mockResolvedValue({
      data: { listGoods: [priceGood(1, 10000, 8000)] },
    });
    const result = await wbFetchOfficialPrices("key");
    expect(result.size).toBe(1);
    expect(mockGetGoodsFilter).toHaveBeenCalledTimes(1);
  });

  // ─── Ошибки SDK ───
  it("SDK выбрасывает ошибку — log.line с сообщением, не падает", async () => {
    mockGetGoodsFilter.mockRejectedValue(new Error("API rate limit exceeded"));
    const log = makeSpyLog();

    const result = await wbFetchOfficialPrices("key", log);
    expect(result.size).toBe(0);
    expect(log.line).toHaveBeenCalledWith(
      expect.stringContaining("API rate limit exceeded")
    );
  });

  it("AuthenticationError от SDK — log.line, не падает", async () => {
    const { AuthenticationError } = await import(
      "daytona-wildberries-typescript-sdk"
    );
    mockGetGoodsFilter.mockRejectedValue(
      new AuthenticationError("Invalid API key")
    );
    const log = makeSpyLog();

    const result = await wbFetchOfficialPrices("bad-key", log);
    expect(result.size).toBe(0);
    expect(log.line).toHaveBeenCalledWith(
      expect.stringContaining("Invalid API key")
    );
  });

  it("NetworkError от SDK — log.line, не падает", async () => {
    const { NetworkError } = await import(
      "daytona-wildberries-typescript-sdk"
    );
    mockGetGoodsFilter.mockRejectedValue(
      new NetworkError("connect ECONNREFUSED")
    );
    const log = makeSpyLog();

    const result = await wbFetchOfficialPrices("key", log);
    expect(result.size).toBe(0);
    expect(log.line).toHaveBeenCalledWith(
      expect.stringContaining("connect ECONNREFUSED")
    );
  });
});
