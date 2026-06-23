/**
 * Проверка: что отдаёт WB с разными заголовками и куками.
 * Запуск: node scripts/check-wb-data.mjs
 */

const ARTICLE = 253051367;

async function getCookies() {
  const res = await fetch("https://www.wildberries.ru/", {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
      Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
      "Accept-Language": "ru-RU,ru;q=0.9",
      "Accept-Encoding": "gzip, deflate, br",
      "Cache-Control": "no-cache",
      Pragma: "no-cache",
      "Sec-Fetch-Dest": "document",
      "Sec-Fetch-Mode": "navigate",
      "Sec-Fetch-Site": "none",
      "Sec-Fetch-User": "?1",
      "Upgrade-Insecure-Requests": "1",
    },
  });
  const cookies = res.headers.getSetCookie?.() || [];
  console.log("Cookies from main page:", cookies.length);
  return cookies.join("; ");
}

async function main() {
  const cookies = await getCookies();

  // === HTML page with cookies ===
  console.log("\n=== HTML Page (with cookies) ===");
  try {
    const res = await fetch(
      `https://www.wildberries.ru/catalog/${ARTICLE}/detail.aspx`,
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
          Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
          "Accept-Language": "ru-RU,ru;q=0.9",
          Cookie: cookies,
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
          "Sec-Fetch-Dest": "document",
          "Sec-Fetch-Mode": "navigate",
          "Sec-Fetch-Site": "none",
          "Sec-Fetch-User": "?1",
          "Upgrade-Insecure-Requests": "1",
        },
      },
    );
    console.log("Status:", res.status);
    if (res.ok) {
      const html = await res.text();
      console.log("HTML length:", html.length);

      const ldMatch = html.match(
        /<script[^>]*type="application\/ld\+json"[^>]*>(.*?)<\/script>/s,
      );
      if (ldMatch) {
        const ld = JSON.parse(ldMatch[1]);
        console.log("JSON-LD name:", ld.name);
        console.log("JSON-LD description:", ld.description?.slice(0, 100));
        console.log("JSON-LD keys:", Object.keys(ld));
        if (ld.offers) console.log("offers:", JSON.stringify(ld.offers).slice(0, 200));
        if (ld.aggregateRating)
          console.log("rating:", JSON.stringify(ld.aggregateRating));
      } else {
        console.log("JSON-LD not found");
      }
    } else {
      console.log("Status text:", res.statusText);
      const text = await res.text();
      console.log("Response:", text.slice(0, 400));
    }
  } catch (e) {
    console.log("HTML error:", e.message);
  }

  // === Try card API v3 ===
  console.log("\n=== Card API v3 ===");
  try {
    const res = await fetch(
      `https://card.wb.ru/cards/v2/detail?appType=1&curr=rub&lang=ru&dest=-1257786&spp=30&nm=${ARTICLE}`,
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
          Accept: "application/json",
          "Accept-Language": "ru-RU,ru;q=0.9",
          Referer: `https://www.wildberries.ru/catalog/${ARTICLE}/detail.aspx`,
          Cookie: cookies,
        },
      },
    );
    console.log("Status:", res.status);
    if (res.ok) {
      const data = await res.json();
      const product = data?.data?.products?.[0];
      if (product) {
        console.log("name:", product.name);
        console.log("price:", product.salePriceU / 100);
        console.log("rating:", product.rating);
        console.log("feedbacks:", product.feedbacks);
        console.log("supplier:", product.supplier);
        console.log("brand:", product.brand);
        console.log("photos:", product.media?.photo?.length);
        console.log("options keys:", Object.keys(product.options || {}));
      }
    } else {
      const text = await res.text();
      console.log("Response:", text.slice(0, 200));
    }
  } catch (e) {
    console.log("Card API error:", e.message);
  }
}

main().catch(console.error);
