/**
 * Тесты для wbFetchAnalytics — парсинг WB Item Rating API.
 *
 * Покрытие:
 *   ✓ пустой вход, нет apiKey
 *   ✓ парсинг ответа (field mapping, pinnedFeedback)
 *   ✓ граничные случаи (null, пустые массивы)
 *   ✓ URL и тело запроса (endpoint, method, headers, body JSON)
 *   ✓ батчинг: размер 50, граница 51 → 2 батча, распределение ID
 *   ✓ 429 rate limit + retry
 *   ✓ 4xx/network error → log.line, не падает
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { wbFetchAnalytics } from "../../scripts/sync-modules/analytics.mjs";

/** Логгер со шпионами для проверки вызовов log.line */
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

function mockFetch(status: number, body: any) {
  globalThis.fetch = vi.fn().mockResolvedValue({
    status,
    ok: status >= 200 && status < 300,
    json: () => Promise.resolve(body),
    text: () => Promise.resolve(typeof body === "string" ? body : JSON.stringify(body)),
  });
}

describe("wbFetchAnalytics", () => {
  // ─── Пустой вход / нет ключа ───
  it("пустой массив nmIDs — возвращает пустой Map", async () => {
    const result = await wbFetchAnalytics([], "key");
    expect(result.size).toBe(0);
  });

  it("нет apiKey (null) — возвращает пустой Map", async () => {
    const result = await wbFetchAnalytics([123], null as any);
    expect(result.size).toBe(0);
  });

  it("нет apiKey (undefined) — возвращает пустой Map", async () => {
    const result = await wbFetchAnalytics([123], undefined as any);
    expect(result.size).toBe(0);
  });

  // ─── Успешный парсинг ───
  it("парсит ответ с одной карточкой — field mapping", async () => {
    mockFetch(200, {
      data: {
        cards: [
          {
            nmId: 123456789,
            title: "Test Bag",
            vendorCode: "wb-test",
            rating: 10,
            feedbackRating: { current: 4.5, dynamics: 0.3, percentile: 2.1 },
            feedbackCount: { current: 12, dynamics: 3 },
            pinnedFeedback: true,
            fiveStar: { current: 8, dynamics: 2 },
            fourStar: { current: 2, dynamics: 0 },
            threeStar: { current: 1, dynamics: 1 },
            twoStar: { current: 0, dynamics: 0 },
            oneStar: { current: 1, dynamics: 0 },
            disqualified: 0,
          },
        ],
      },
    });

    const result = await wbFetchAnalytics([123456789], "test-key");
    expect(result.size).toBe(1);
    const entry = result.get(123456789)!;
    expect(entry.productRating).toBe(4.5);
    expect(entry.feedbackRating).toEqual({ current: 4.5, dynamics: 0.3, percentile: 2.1 });
    expect(entry.feedbackCount).toBe(12);
    expect(entry.pinnedFeedback).toBe(true);
  });

  it("несколько карточек — маппится по nmId", async () => {
    mockFetch(200, {
      data: {
        cards: [
          { nmId: 111, feedbackRating: { current: 4.0 }, feedbackCount: { current: 5 }, pinnedFeedback: false },
          { nmId: 222, feedbackRating: { current: 3.5 }, feedbackCount: { current: 3 }, pinnedFeedback: true },
          { nmId: 333, feedbackRating: { current: 5.0 }, feedbackCount: { current: 10 }, pinnedFeedback: false },
        ],
      },
    });

    const result = await wbFetchAnalytics([111, 222, 333], "key");
    expect(result.size).toBe(3);
    expect(result.get(111)!.productRating).toBe(4.0);
    expect(result.get(222)!.productRating).toBe(3.5);
    expect(result.get(333)!.productRating).toBe(5.0);
    expect(result.get(222)!.pinnedFeedback).toBe(true);
  });

  // ─── URL и тело запроса ───
  it("отправляет POST на правильный endpoint с JSON body", async () => {
    mockFetch(200, { data: { cards: [] } });
    await wbFetchAnalytics([111, 222], "my-token");

    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
    const [url, init] = (globalThis.fetch as any).mock.calls[0];
    expect(url).toBe("https://seller-analytics-api.wildberries.ru/api/analytics/v1/item-rating");
    expect(init.method).toBe("POST");
    expect(init.headers.Authorization).toBe("my-token");
    expect(init.headers["Content-Type"]).toBe("application/json");

    const body = JSON.parse(init.body);
    expect(body.nmIds).toEqual([111, 222]);
    expect(body.limit).toBe(50);
    expect(body.offset).toBe(0);
    expect(body.orderBy).toEqual({ field: "openCount", mode: "desc" });
    expect(body.isNotIncludeNMsWithoutSales).toBe(false);
    // period — ISO date string
    expect(body.currentPeriod).toBeDefined();
    expect(body.currentPeriod.start).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(body.currentPeriod.end).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  // ─── Граничные случаи полей ───
  it("feedbackRating отсутствует — productRating = null", async () => {
    mockFetch(200, {
      data: { cards: [{ nmId: 1, feedbackRating: null, feedbackCount: { current: 0 } }] },
    });
    expect((await wbFetchAnalytics([1], "key")).get(1)!.productRating).toBeNull();
  });

  it("feedbackCount отсутствует — feedbackCount = null", async () => {
    mockFetch(200, {
      data: { cards: [{ nmId: 1, feedbackRating: { current: 4.0 }, feedbackCount: null }] },
    });
    expect((await wbFetchAnalytics([1], "key")).get(1)!.feedbackCount).toBeNull();
  });

  it("pinnedFeedback отсутствует — по умолчанию false", async () => {
    mockFetch(200, {
      data: { cards: [{ nmId: 1, feedbackRating: { current: 4.0 }, feedbackCount: { current: 5 } }] },
    });
    expect((await wbFetchAnalytics([1], "key")).get(1)!.pinnedFeedback).toBe(false);
  });

  it("карточка без nmId — пропускается", async () => {
    mockFetch(200, {
      data: {
        cards: [
          { nmId: null, title: "skip me", feedbackRating: { current: 4.0 } },
          { nmId: 42, feedbackRating: { current: 3.0 }, feedbackCount: { current: 1 } },
        ],
      },
    });
    const result = await wbFetchAnalytics([42], "key");
    expect(result.size).toBe(1);
    expect(result.get(42)).toBeDefined();
    expect(result.get(42)!.productRating).toBe(3.0);
    expect(Array.from(result.keys())).toEqual([42]);
  });

  // ─── Пустой ответ ───
  it("data отсутствует — пустой результат", async () => {
    mockFetch(200, {});
    expect((await wbFetchAnalytics([1], "key")).size).toBe(0);
  });

  it("data.cards отсутствует — пустой результат", async () => {
    mockFetch(200, { data: {} });
    expect((await wbFetchAnalytics([1], "key")).size).toBe(0);
  });

  it("пустой cards — пустой результат", async () => {
    mockFetch(200, { data: { cards: [] } });
    expect((await wbFetchAnalytics([1], "key")).size).toBe(0);
  });

  // ─── Rate limit 429 ───
  it("429 rate limit — retry после 30s ожидания", async () => {
    globalThis.fetch = vi
      .fn()
      .mockResolvedValueOnce({
        status: 429,
        ok: false,
        text: () => Promise.resolve("too many"),
      })
      .mockResolvedValueOnce({
        status: 200,
        ok: true,
        json: () =>
          Promise.resolve({
            data: { cards: [{ nmId: 1, feedbackRating: { current: 4.2 }, feedbackCount: { current: 8 } }] },
          }),
      });

    vi.useFakeTimers();
    const promise = wbFetchAnalytics([1], "key");
    await vi.advanceTimersByTimeAsync(30000);
    const result = await promise;
    vi.useRealTimers();

    expect(result.size).toBe(1);
    expect(result.get(1)!.productRating).toBe(4.2);
    expect(globalThis.fetch).toHaveBeenCalledTimes(2);
  });

  // ─── Ошибки ───
  it("4xx ошибка — log.line с кодом и текстом, не падает", async () => {
    mockFetch(400, { error: true, errorText: "Bad request" });
    const log = makeSpyLog();

    const result = await wbFetchAnalytics([1], "key", log);
    expect(result.size).toBe(0);
    expect(log.line).toHaveBeenCalledWith(expect.stringContaining("400"));
    expect(log.line).toHaveBeenCalledWith(expect.stringContaining("Bad request"));
    expect(log.line.mock.calls[0][0]).toMatch(/Analytics API 400/);
  });

  it("network error — log.line с сообщением ошибки, не падает", async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new Error("ECONNRESET"));
    const log = makeSpyLog();

    const result = await wbFetchAnalytics([1], "key", log);
    expect(result.size).toBe(0);
    expect(log.line).toHaveBeenCalledWith(expect.stringContaining("ECONNRESET"));
    expect(log.line.mock.calls[0][0]).toMatch(/Analytics API error/);
  });

  // ─── Батчинг ───
  it("батчинг: ровно 50 — 1 запрос", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      status: 200,
      ok: true,
      json: () => Promise.resolve({ data: { cards: [] } }),
    });

    const ids = Array.from({ length: 50 }, (_, i) => i + 1);
    await wbFetchAnalytics(ids, "key");
    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
  });

  it("батчинг: 51 → 2 батча (50 + 1)", async () => {
    vi.useFakeTimers();
    const capturedBodies: any[] = [];
    globalThis.fetch = vi.fn().mockImplementation((url, init) => {
      capturedBodies.push(JSON.parse(init.body));
      return Promise.resolve({
        status: 200,
        ok: true,
        json: () => Promise.resolve({ data: { cards: [] } }),
      });
    });

    const ids = Array.from({ length: 51 }, (_, i) => i + 1);
    const promise = wbFetchAnalytics(ids, "key");
    await vi.advanceTimersByTimeAsync(60000);
    await promise;
    vi.useRealTimers();

    expect(globalThis.fetch).toHaveBeenCalledTimes(2);
    expect(capturedBodies[0].nmIds).toHaveLength(50);
    expect(capturedBodies[0].nmIds).toEqual(ids.slice(0, 50));
    expect(capturedBodies[1].nmIds).toHaveLength(1);
    expect(capturedBodies[1].nmIds).toEqual([51]);
  });

  it("батчинг: 120 → 3 батча с правильным распределением ID", async () => {
    vi.useFakeTimers();
    const capturedBodies: any[] = [];
    globalThis.fetch = vi.fn().mockImplementation((url, init) => {
      capturedBodies.push(JSON.parse(init.body));
      return Promise.resolve({
        status: 200,
        ok: true,
        json: () => Promise.resolve({ data: { cards: [] } }),
      });
    });

    const ids = Array.from({ length: 120 }, (_, i) => i + 1);
    const promise = wbFetchAnalytics(ids, "key");
    await vi.advanceTimersByTimeAsync(120000);
    await promise;
    vi.useRealTimers();

    expect(globalThis.fetch).toHaveBeenCalledTimes(3);
    expect(capturedBodies[0].nmIds).toEqual(ids.slice(0, 50));
    expect(capturedBodies[1].nmIds).toEqual(ids.slice(50, 100));
    expect(capturedBodies[2].nmIds).toEqual(ids.slice(100, 120));
  });
});
