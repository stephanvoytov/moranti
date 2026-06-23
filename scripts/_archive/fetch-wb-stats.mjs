import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { readFileSync, writeFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const prisma = new PrismaClient();

// All known WB basket hosts (we'll try them in order)
const BASKET_HOSTS = [];
for (let i = 1; i <= 60; i++) {
  BASKET_HOSTS.push('https://basket-' + String(i).padStart(2, '0') + '.wbbasket.ru');
}

const FEEDBACK_API = 'https://feedback-view-01.wb.ru/feedbacks/v2';
const FETCH_TIMEOUT = 10000;

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function fetchWithRetry(label, url, retries = 2) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const r = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          Accept: 'application/json',
          Origin: 'https://www.wildberries.ru',
          Referer: 'https://www.wildberries.ru/',
        },
        signal: AbortSignal.timeout(FETCH_TIMEOUT),
      });
      if (r.ok) return { ok: true, data: await r.json() };
      if (r.status === 404) return { ok: false, status: 404 };
      if (r.status === 403) return { ok: false, status: 403 };
    } catch (e) {
      if (attempt < retries) {
        await sleep(1000 * (attempt + 1));
      }
    }
  }
  return { ok: false, error: 'failed after retries' };
}

async function getImtId(article) {
  const vol = Math.floor(article / 100000);
  const part = Math.floor(article / 1000);

  // Try all known hosts
  for (const host of BASKET_HOSTS) {
    const url = host + '/vol' + vol + '/part' + part + '/' + article + '/info/ru/card.json';
    const result = await fetchWithRetry('card', url, 1);
    if (result.ok && result.data && result.data.imt_id) {
      return { imtId: result.data.imt_id, host: host };
    }
  }
  return null;
}

async function getFeedbackStats(imtId) {
  const url = FEEDBACK_API + '/' + imtId;
  const result = await fetchWithRetry('feedback', url);
  if (result.ok && result.data) {
    const d = result.data;
    return {
      rating: d.valuationSum && d.feedbackCount > 0
        ? Math.round((d.valuationSum / d.feedbackCount) * 10) / 10
        : null,
      reviewsCount: d.feedbackCount || 0,
    };
  }
  return null;
}

async function main() {
  const products = await prisma.product.findMany({
    where: { wbArticle: { not: null } },
    select: { id: true, wbArticle: true, imtId: true },
    orderBy: { wbArticle: 'asc' },
  });
  console.log('Products to process:', products.length);

  const results = [];
  let success = 0;
  let fail = 0;

  for (const p of products) {
    const article = p.wbArticle;
    console.log('[' + p.id + '] article=' + article + '...');

    // Step 1: Get imtId (use stored one or fetch)
    let imtId = p.imtId;
    let source = 'db';
    if (!imtId) {
      const card = await getImtId(article);
      if (card) {
        imtId = card.imtId;
        source = card.host.split('/')[2];
        // Save imtId to DB for next time
        await prisma.product.update({
          where: { id: p.id },
          data: { imtId: imtId },
        });
        console.log('  imtId=' + imtId + ' (via ' + source + ')');
      } else {
        console.log('  FAIL: no card.json found');
        fail++;
        continue;
      }
    }

    // Step 2: Get feedback stats
    const stats = await getFeedbackStats(imtId);
    if (stats) {
      await prisma.product.update({
        where: { id: p.id },
        data: {
          rating: stats.rating,
          reviewsCount: stats.reviewsCount,
        },
      });
      console.log('  rating=' + stats.rating + ' reviews=' + stats.reviewsCount + ' (from feedback API)');
      success++;
    } else {
      console.log('  FAIL: no feedback data');
      fail++;
    }

    // Be nice to WB servers
    await sleep(300);
  }

  console.log('\nDone: ' + success + ' updated, ' + fail + ' failed');
}

main()
  .catch((e) => { console.error('FATAL:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
