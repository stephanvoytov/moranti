/**
 * analytics.mjs — WB Analytics API (Item Rating).
 *
 * Эндпоинт: POST /api/analytics/v1/item-rating
 * Документация: https://dev.wildberries.ru/openapi/analytics#tag/Item-Rating
 *
 * Схема ответа: { data: { sellerRating, feedbackIncrease, cards: [
 *   { nmId, rating, feedbackRating: { current, dynamics, percentile },
 *     feedbackCount: { current, dynamics }, pinnedFeedback, … }
 * ] } }
 *
 * Для рейтинга товара используем feedbackRating.current (1-5, средняя оценка по отзывам).
 * pinnedFeedback = закреплённый отзыв (продавец пришпилил наверх).
 *
 * Требует токен категории Analytics.
 * Rate limit: 3 запроса / 1 мин / аккаунт.
 *
 * @module sync-modules/analytics
 */

const WB_ANALYTICS_API = "https://seller-analytics-api.wildberries.ru";
const FETCH_TIMEOUT = 30000;

/** Логгер по умолчанию — тихий, для тестов. */
const noopLog = {
  write: () => {},
  line: () => {},
  progress: () => {},
  detail: () => {},
};

/**
 * Получение рейтингов и отзывов через WB Analytics (Item Rating API).
 *
 * @param {number[]} nmIDs — массив артикулов WB
 * @param {string}  apiKey — токен категории Analytics
 * @param {object}  log    — логгер (опционально, по умолчанию noop)
 * @returns {Promise<Map<number, {productRating, feedbackRating, feedbackCount, pinnedFeedback}>>}
 */
export async function wbFetchAnalytics(nmIDs, apiKey, log = noopLog) {
  if (!nmIDs || nmIDs.length === 0 || !apiKey) return new Map();
  const analyticsMap = new Map();

  log.write(`  Fetching WB analytics for ${nmIDs.length} cards:`);

  // Батчим по 50 nmId (ограничение API)
  const BATCH = 50;
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const periodStart = thirtyDaysAgo.toISOString().split("T")[0];
  const periodEnd = now.toISOString().split("T")[0];

  for (let i = 0; i < nmIDs.length; i += BATCH) {
    const chunk = nmIDs.slice(i, i + BATCH);

    const body = {
      currentPeriod: { start: periodStart, end: periodEnd },
      nmIds: chunk,
      orderBy: { field: "openCount", mode: "desc" },
      limit: BATCH,
      offset: 0,
      isNotIncludeNMsWithoutSales: false,
    };

    try {
      const resp = await fetch(`${WB_ANALYTICS_API}/api/analytics/v1/item-rating`, {
        method: "POST",
        headers: {
          Authorization: apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(FETCH_TIMEOUT),
      });

      if (resp.status === 429) {
        log.write(" 429 (rate limit, waiting 30s)");
        await new Promise((r) => setTimeout(r, 30000));
        // Повторяем батч (без рекурсии — для 2-3 батчей достаточно одного retry)
        i -= BATCH;
        continue;
      }

      if (!resp.ok) {
        const text = await resp.text().catch(() => "");
        log.line(`\n  Analytics API ${resp.status}: ${text.slice(0, 200)}`);
        continue;
      }

      const data = await resp.json();
      const cards = data?.data?.cards || [];

      for (const item of cards) {
        const nmId = item.nmId;
        if (nmId) {
          analyticsMap.set(nmId, {
            productRating: item.feedbackRating?.current ?? null,
            feedbackRating: item.feedbackRating ?? null,
            feedbackCount: item.feedbackCount?.current ?? null,
            pinnedFeedback: item.pinnedFeedback ?? false,
          });
        }
      }

      log.write(` ${analyticsMap.size}`);
    } catch (err) {
      log.line(`\n  Analytics API error: ${err.message}`);
    }

    // Rate limit: 3 req/min → ждём 25с между батчами
    if (i + BATCH < nmIDs.length) {
      await new Promise((r) => setTimeout(r, 25000));
    }
  }

  log.line(` — ${analyticsMap.size} products`);
  return analyticsMap;
}
