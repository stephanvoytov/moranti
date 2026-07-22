/**
 * Тесты для wbFetchStocks — WB Analytics API (остатки/стоки) через SDK.
 *
 * Покрытие:
 *   ✓ пустой вход, нет apiKey
 *   ✓ парсинг ответа stockCount
 *   ✓ несколько товаров
 *   ✓ SDK ошибка → log.line, не падает
 *   ✓ батчинг: 2500 nmID → 3 запроса
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { wbFetchStocks } from "../../scripts/sync-modules/stocks.mjs";

// ─── Mock SDK ───
const mockCreateProductsProduct = vi.fn();
const mockSDKConstructor = vi.fn();

vi.mock("daytona-wildberries-typescript-sdk", () => {
  class MockWildberriesSDK {
    analytics: { createProductsProduct: typeof mockCreateProductsProduct };
    constructor(config: any) {
      mockSDKConstructor(config);
      this.analytics = {
        createProductsProduct: mockCreateProductsProduct,
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
  mockCreateProductsProduct.mockReset();
});

function stockItem(nmID: number, stockCount: number, vendorCode = `vendor-${nmID}`) {
  return {
    nmID,
    vendorCode,
    isDeleted: false,
    name: `Product ${nmID}`,
    subjectName: "Сумки женские",
    brandName: "Moranti",
    mainPhoto: "",
    hasSizes: false,
    metrics: {
      ordersCount: 0,
      ordersSum: 0,
      avgOrders: 0,
      avgOrdersByMonth: [],
      buyoutCount: 0,
      buyoutSum: 0,
      buyoutPercent: 0,
      stockCount,
      stockSum: stockCount * 1000,
      saleRate: { days: 30, hours: 0 },
      avgStockTurnover: { days: 30, hours: 0 },
      toClientCount: 0,
      fromClientCount: 0,
      officeMissingTime: { days: 0, hours: 0 },
      lostOrdersCount: 0,
      lostOrdersSum: 0,
      lostBuyoutsCount: 0,
      lostBuyoutsSum: 0,
      currentPrice: { minPrice: 5000, maxPrice: 5000 },
      availability: "actual",
    },
  };
}

describe("wbFetchStocks", () => {
  // ─── Нет ключа / пустой вход ───
  it("пустой массив nmIDs — возвращает пустой Map", async () => {
    const result = await wbFetchStocks([], "key");
    expect(result.size).toBe(0);
  });

  it("нет apiKey (null) — возвращает пустой Map", async () => {
    const result = await wbFetchStocks([123], null as any);
    expect(result.size).toBe(0);
  });

  it("нет apiKey (undefined) — возвращает пустой Map", async () => {
    const result = await wbFetchStocks([123], undefined as any);
    expect(result.size).toBe(0);
  });

  // ─── Успешный парсинг ───
  it("парсит stockCount из ответа SDK", async () => {
    mockCreateProductsProduct.mockResolvedValue({
      data: { items: [stockItem(98486, 42)] },
    });

    const result = await wbFetchStocks([98486], "test-key");
    expect(result.size).toBe(1);
    expect(result.get(98486)).toBe(42);
  });

  it("несколько товаров — маппится по nmID", async () => {
    mockCreateProductsProduct.mockResolvedValue({
      data: {
        items: [
          stockItem(111, 10),
          stockItem(222, 0),
          stockItem(333, 100),
        ],
      },
    });

    const result = await wbFetchStocks([111, 222, 333], "key");
    expect(result.size).toBe(3);
    expect(result.get(111)).toBe(10);
    expect(result.get(222)).toBe(0);
    expect(result.get(333)).toBe(100);
  });

  it("нулевой stockCount — сохраняется как 0", async () => {
    mockCreateProductsProduct.mockResolvedValue({
      data: { items: [stockItem(1, 0)] },
    });
    const result = await wbFetchStocks([1], "key");
    expect(result.get(1)).toBe(0);
  });

  // ─── SDK вызывается с правильными параметрами ───
  it("передаёт nmIDs, period, stockType='' в SDK", async () => {
    mockCreateProductsProduct.mockResolvedValue({
      data: { items: [] },
    });

    await wbFetchStocks([111, 222], "my-token");

    expect(mockCreateProductsProduct).toHaveBeenCalledTimes(1);
    const callArgs = mockCreateProductsProduct.mock.calls[0][0];
    expect(callArgs.nmIDs).toEqual([111, 222]);
    expect(callArgs.stockType).toBe("");
    expect(callArgs.skipDeletedNm).toBe(true);
    expect(callArgs.availabilityFilters).toEqual([]);
    expect(callArgs.orderBy).toEqual({ field: "stockCount", mode: "desc" });
    expect(callArgs.currentPeriod).toBeDefined();
    expect(callArgs.currentPeriod.start).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(callArgs.currentPeriod.end).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("передаёт apiKey в конструктор SDK", async () => {
    mockCreateProductsProduct.mockResolvedValue({
      data: { items: [] },
    });

    await wbFetchStocks([1], "custom-api-key");

    expect(mockSDKConstructor).toHaveBeenCalledWith(
      expect.objectContaining({ apiKey: "custom-api-key" })
    );
  });

  // ─── Пропуск товаров без данных ───
  it("товар без nmID — пропускается", async () => {
    mockCreateProductsProduct.mockResolvedValue({
      data: {
        items: [
          { nmID: null, vendorCode: "skip", metrics: { stockCount: 5 } },
          stockItem(42, 3),
        ],
      },
    });
    const result = await wbFetchStocks([42], "key");
    expect(result.size).toBe(1);
    expect(result.has(42)).toBe(true);
    expect(result.get(42)).toBe(3);
  });

  it("метрики без stockCount — пропускается", async () => {
    mockCreateProductsProduct.mockResolvedValue({
      data: {
        items: [
          { nmID: 1, vendorCode: "v1", metrics: {} },
          stockItem(2, 7),
        ],
      },
    });
    const result = await wbFetchStocks([1, 2], "key");
    expect(result.size).toBe(1);
    expect(result.has(1)).toBe(false);
    expect(result.get(2)).toBe(7);
  });

  // ─── Пустой ответ ───
  it("data отсутствует — пустой результат", async () => {
    mockCreateProductsProduct.mockResolvedValue({});
    expect((await wbFetchStocks([1], "key")).size).toBe(0);
  });

  it("data.items отсутствует — пустой результат", async () => {
    mockCreateProductsProduct.mockResolvedValue({ data: {} });
    expect((await wbFetchStocks([1], "key")).size).toBe(0);
  });

  it("пустой items — пустой результат", async () => {
    mockCreateProductsProduct.mockResolvedValue({ data: { items: [] } });
    expect((await wbFetchStocks([1], "key")).size).toBe(0);
  });

  // ─── Батчинг ───
  it("батчинг: 2500 nmID → 3 запроса, offset: 0→1000→2000", async () => {
    const capturedParams: any[] = [];
    mockCreateProductsProduct.mockImplementation((params) => {
      capturedParams.push({ ...params });
      const chunk = params.nmIDs || [];
      const items = chunk
        .filter((id: any) => id != null)
        .map((id: any) => stockItem(id, 10));
      return Promise.resolve({ data: { items } });
    });

    const ids = Array.from({ length: 2500 }, (_, i) => i + 1);
    const result = await wbFetchStocks(ids, "key");

    expect(mockCreateProductsProduct).toHaveBeenCalledTimes(3);
    expect(result.size).toBe(2500);

    expect(capturedParams[0].nmIDs).toEqual(ids.slice(0, 1000));
    expect(capturedParams[1].nmIDs).toEqual(ids.slice(1000, 2000));
    expect(capturedParams[2].nmIDs).toEqual(ids.slice(2000, 2500));
  });

  it("батчинг: 1 товар → 1 запрос", async () => {
    mockCreateProductsProduct.mockResolvedValue({
      data: { items: [stockItem(1, 5)] },
    });
    const result = await wbFetchStocks([1], "key");
    expect(result.size).toBe(1);
    expect(mockCreateProductsProduct).toHaveBeenCalledTimes(1);
  });

  it("батчинг: ровно 1000 → 1 запрос", async () => {
    mockCreateProductsProduct.mockImplementation((params: any) => {
      const items = (params.nmIDs || []).map((id: number) => stockItem(id, 1));
      return Promise.resolve({ data: { items } });
    });

    const ids = Array.from({ length: 1000 }, (_, i) => i + 1);
    const result = await wbFetchStocks(ids, "key");
    expect(result.size).toBe(1000);
    expect(mockCreateProductsProduct).toHaveBeenCalledTimes(1);
  });

  // ─── Ошибки SDK ───
  it("SDK выбрасывает ошибку — log.line с сообщением, не падает", async () => {
    mockCreateProductsProduct.mockRejectedValue(
      new Error("API rate limit exceeded")
    );
    const log = makeSpyLog();

    const result = await wbFetchStocks([1], "key", log);
    expect(result.size).toBe(0);
    expect(log.line).toHaveBeenCalledWith(
      expect.stringContaining("API rate limit exceeded")
    );
  });

  it("AuthenticationError от SDK — log.line, не падает", async () => {
    const { AuthenticationError } = await import(
      "daytona-wildberries-typescript-sdk"
    );
    mockCreateProductsProduct.mockRejectedValue(
      new AuthenticationError("Invalid API key")
    );
    const log = makeSpyLog();

    const result = await wbFetchStocks([1], "bad-key", log);
    expect(result.size).toBe(0);
    expect(log.line).toHaveBeenCalledWith(
      expect.stringContaining("Invalid API key")
    );
  });

  it("NetworkError от SDK — log.line, не падает", async () => {
    const { NetworkError } = await import(
      "daytona-wildberries-typescript-sdk"
    );
    mockCreateProductsProduct.mockRejectedValue(
      new NetworkError("connect ECONNREFUSED")
    );
    const log = makeSpyLog();

    const result = await wbFetchStocks([1], "key", log);
    expect(result.size).toBe(0);
    expect(log.line).toHaveBeenCalledWith(
      expect.stringContaining("connect ECONNREFUSED")
    );
  });
});
