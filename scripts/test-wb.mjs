// Test various WB data sources
const article = 969008238;

async function tryFetch(label, url, opts = {}) {
  try {
    const r = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        Accept: 'application/json, text/html',
        ...opts.headers,
      },
      signal: AbortSignal.timeout(opts.timeout || 8000),
      ...opts,
    });
    console.log(label + ': ' + r.status + (r.ok ? ' OK' : ' FAIL'));
    if (r.ok) return r;
  } catch (e) {
    console.log(label + ': ERROR ' + e.message);
  }
  return null;
}

async function main() {
  const article = 969008238;
  const vol = Math.floor(article / 100000);
  const part = Math.floor(article / 1000);
  const basketNames = ['basket-01', 'basket-02', 'basket-05', 'basket-08', 'basket-10', 'basket-12', 'basket-15'];

  // 1. Basket card.json (static product data from CDN)
  for (const b of basketNames) {
    const url = 'https://' + b + '.wbbasket.ru/vol' + vol + '/part' + part + '/' + article + '/info/ru/card.json';
    const r = await tryFetch(b, url);
    if (r) {
      const d = await r.json();
      console.log('  reviewRating: ' + d.reviewRating + ', feedbacks: ' + d.feedbacks + ', supplies: ' + (d.supplies ? d.supplies.length : 0));
      return;
    }
  }

  // 2. Product page HTML
  const r2 = await tryFetch('product-page', 'https://www.wildberries.ru/catalog/' + article + '/detail.aspx', {
    headers: { Accept: 'text/html' },
  });
  if (r2) {
    const html = await r2.text();
    const m1 = html.match(/"rating":\s*([\d.]+)/);
    if (m1) console.log('  rating in HTML: ' + m1[1]);
    const m2 = html.match(/"feedbackCount":\s*(\d+)/);
    if (m2) console.log('  feedbackCount: ' + m2[1]);
    const m3 = html.match(/"feedbacksQuantity":\s*(\d+)/);
    if (m3) console.log('  feedbacksQuantity: ' + m3[1]);
    const title = html.match(/<title>([^<]*)<\/title>/);
    if (title) console.log('  title: ' + title[1]);
    console.log('  HTML length: ' + html.length);
  }
}

main().catch(console.error);
