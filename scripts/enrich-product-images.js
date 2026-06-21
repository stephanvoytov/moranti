/* =============================================
   Enrich Product Images from WB card.json
   - For each product, fetches card.json
   - Extracts media.photo_count
   - Generates confirmed image URLs
   - Updates products.json
   ============================================= */

const fs = require("fs");
const path = require("path");

const PRODUCTS_FILE = path.join(__dirname, "..", "data", "products.json");

// WB CDN patterns
const IMAGE_URL_RE = /\/vol(\d+)\/part(\d+)\/(\d+)\/images\//;

async function fetchCardJson(vol, part, article) {
  const url = `https://kgd-basket-cdn-01bl.geobasket.ru/vol${vol}/part${part}/${article}/info/ru/card.json`;
  const resp = await fetch(url);
  if (!resp.ok) {
    throw new Error(`HTTP ${resp.status} for ${url}`);
  }
  return resp.json();
}

function parseImageUrl(imageUrl) {
  const match = imageUrl.match(IMAGE_URL_RE);
  if (!match) return null;
  return {
    vol: match[1],
    part: match[2],
    article: match[3],
  };
}

function generateImageUrls(vol, part, article, count) {
  const base = `https://kgd-basket-cdn-01bl.geobasket.ru/vol${vol}/part${part}/${article}/images/c516x688`;
  const urls = [];
  for (let i = 1; i <= count; i++) {
    urls.push(`${base}/${i}.webp`);
  }
  return urls;
}

async function main() {
  const raw = fs.readFileSync(PRODUCTS_FILE, "utf-8");
  const data = JSON.parse(raw);
  const products = data.products;

  let updated = 0;
  let failed = 0;

  for (const product of products) {
    if (!product.image || !product.wbArticle) {
      console.log(`SKIP ${product.id}: no image or wbArticle`);
      continue;
    }

    const parsed = parseImageUrl(product.image);
    if (!parsed) {
      console.log(`SKIP ${product.id}: cannot parse image URL`);
      continue;
    }

    try {
      const card = await fetchCardJson(parsed.vol, parsed.part, parsed.article);
      const photoCount = card?.media?.photo_count;

      if (!photoCount || photoCount < 1) {
        console.log(`SKIP ${product.id} (${product.wbArticle}): no photo_count in card.json`);
        continue;
      }

      const imageUrls = generateImageUrls(parsed.vol, parsed.part, parsed.article, photoCount);
      product.images = imageUrls;
      updated++;
      console.log(`OK ${product.id} (${product.wbArticle}): ${photoCount} photos`);

      // Small delay to avoid hammering CDN
      await new Promise((r) => setTimeout(r, 150));
    } catch (err) {
      failed++;
      console.log(`FAIL ${product.id} (${product.wbArticle}): ${err.message}`);
    }
  }

  // Write back
  fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(data, null, 2) + "\n", "utf-8");
  console.log(`\nDone: ${updated} updated, ${failed} failed`);
}

main().catch(console.error);
