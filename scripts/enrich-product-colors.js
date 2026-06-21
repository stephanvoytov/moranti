/* =============================================
   Enrich Products with Color Group Data (v2)
   - Collects all card.json for each imt group
   - Cross-references nm_colors_names across variants
   - Maps color names to nm_ids reliably
   ============================================= */

const fs = require("fs");
const path = require("path");

const PRODUCTS_FILE = path.join(__dirname, "..", "data", "products.json");

const IMAGE_URL_RE = /\/vol(\d+)\/part(\d+)\/(\d+)\/images\//;

async function fetchCardJson(vol, part, article) {
  const url = `https://kgd-basket-cdn-01bl.geobasket.ru/vol${vol}/part${part}/${article}/info/ru/card.json`;
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  return resp.json();
}

function parseImageUrl(imageUrl) {
  const match = imageUrl.match(IMAGE_URL_RE);
  if (!match) return null;
  return { vol: match[1], part: match[2], article: match[3] };
}

/** Color hints from vendor_code suffixes (lowercase key → display name) */
const COLOR_HINTS = {
  "taup": "Тауп",
  "taupe": "Тауп",
  "brown": "Коричневый",
  "beige": "Бежевый",
  "grey": "Серый",
  "gray": "Серый",
  "black": "Чёрный",
  "white": "Белый",
  "green": "Зелёный",
  "red": "Красный",
  "blue": "Синий",
  "pink": "Розовый",
  "burgundy": "Бордовый",
  "camel": "Верблюжий",
  "sand": "Песочный",
  "pesok": "Песочный",
  "cream": "Кремовый",
  "milk": "Молочный",
  "navy": "Тёмно-синий",
  "cognac": "Коньячный",
  "wine": "Винный",
  "vinny": "Винный",
  "marsala": "Марсала",
  "light": "Светлый",
  "dark": "Тёмный",
  "garnet": "Гранатовый",
  "chocolate": "Шоколадный",
  "шоколад": "Шоколадный",
  "choko": "Шоколадный",
  "choco": "Шоколадный",
  "oreh": "Ореховый",
  "pistachio": "Фисташковый",
  "olive": "Оливковый",
  "gold": "Золотой",
  "silver": "Серебряный",
  "rose": "Розовый",
  "purple": "Фиолетовый",
  "violet": "Фиолетовый",
  "mint": "Мятный",
  "coffee": "Кофейный",
  "ivory": "Айвори",
  "blush": "Блаш",
  "nude": "Нюд",
  "mushroom": "Грибной",
  "clay": "Глиняный",
  "terracotta": "Терракотовый",
  "ecru": "Экрю",
  "burgundi": "Бургунди",
  "champagne": "Шампань",
  "coral": "Коралловый",
  "leopard": "Леопардовый",
  "snake": "Змеиный",
  "mocca": "Мокко",
  "capuccino": "Капучино",
  "latte": "Латте",
  "honey": "Медовый",
  "caramel": "Карамельный",
  "karamel": "Карамельный",
  "vanilla": "Ванильный",
  "smoky": "Дымчатый",
  "asphalt": "Асфальт",
  "graphite": "Графитовый",
  "graphit": "Графитовый",
  "yellow": "Жёлтый",
  "limon": "Лимонный",
  "lemon": "Лимонный",
  "malina": "Малиновый",
  "malinov": "Малиновый",
  "vishn": "Вишнёвый",
  "kofe": "Кофейный",
  "coffee": "Кофейный",
  "slivoch": "Сливочный",
  "kremov": "Кремовый",
  "pudr": "Пудровый",
  "pyzhn": "Пыжиковый",
  "trava": "Травяной",
  "bolot": "Болотный",
  "goroh": "Гороховый",
  "mustard": "Горчичный",
  "golub": "Голубой",
  "nebes": "Небесный",
  "biryuz": "Бирюзовый",
  "fuxia": "Фуксия",
  "lilov": "Сиреневый",
  "siren": "Сирень",
  "lila": "Лиловый",
};

/** Specific vendor_code → color overrides for edge cases */
const VENDOR_COLOR_OVERRIDES = {
  "shopp01bornew": "Бордовый",
  "balensagr": "Серый",
  "sopp01gr45/30": "Графитовый",
  "sopp01pin45/30": "Розовый",
};

/** Try to find color name in vendor_code */
function colorFromVendorCode(vendorCode) {
  if (!vendorCode) return "";

  // Strategy 0: Check exact vendor code overrides
  const code = vendorCode.toLowerCase();
  if (VENDOR_COLOR_OVERRIDES[code]) return VENDOR_COLOR_OVERRIDES[code];

  // Strategy 1: Split CamelCase and check each segment
  const segments = vendorCode.split(/(?<=[a-z])(?=[A-Z\d])|(?<=[A-Z])(?=[A-Z][a-z])/);
  for (const seg of segments) {
    const segLow = seg.toLowerCase();
    // Try matching full segment against color hints
    for (const [key, name] of Object.entries(COLOR_HINTS)) {
      if (segLow === key) return name;
    }
  }

  // Strategy 2: Substring match (only for longer patterns ≥4 chars)
  for (const [key, name] of Object.entries(COLOR_HINTS)) {
    if (key.length < 4) continue; // skip short patterns for substring matching
    if (code.includes(key)) return name;
  }

  // Strategy 3: Check last CamelCase segment against short keys
  for (let i = segments.length - 1; i >= 0; i--) {
    const segLow = segments[i].toLowerCase();
    for (const [key, name] of Object.entries(COLOR_HINTS)) {
      if (key.length >= 3 && segLow.includes(key)) return name;
    }
  }

  return "";
}

/** Capitalize first letter */
function cap(str) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

async function main() {
  const raw = fs.readFileSync(PRODUCTS_FILE, "utf-8");
  const data = JSON.parse(raw);
  const products = data.products;

  // Build a map of wbArticle → product
  const articleMap = new Map();
  for (const p of products) {
    if (p.wbArticle) articleMap.set(p.wbArticle, p);
  }

  // Step 1: Collect all card.json data
  const cardsByArticle = new Map();

  for (const product of products) {
    if (!product.image || !product.wbArticle) continue;
    const parsed = parseImageUrl(product.image);
    if (!parsed) continue;

    try {
      const card = await fetchCardJson(parsed.vol, parsed.part, parsed.article);
      cardsByArticle.set(product.wbArticle, card);
      console.log(`CARD ${product.id} (${product.wbArticle})`);
      await new Promise((r) => setTimeout(r, 80));
    } catch (err) {
      console.log(`FAIL ${product.id}: card.json ${err.message}`);
    }
  }

  // Step 2: Build color mapping per imt group
  // imtGroupMap: imtId → { nmId → colorName }
  const imtGroupMap = new Map();

  for (const [article, card] of cardsByArticle) {
    const imtId = card.imt_id;
    if (!imtId) continue;

    if (!imtGroupMap.has(imtId)) {
      imtGroupMap.set(imtId, new Map());
    }
    const groupColors = imtGroupMap.get(imtId);

    // Parse nm_colors_names into array
    const colorNames = (card.nm_colors_names || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    // colors array (all nm_ids in this group)
    const allNmIds = card.colors || [];

    // Map each nm_id to color name by checking:
    // (1) nm_colors_names index position
    // (2) vendor_code
    // (3) other cards in the same group

    for (let i = 0; i < allNmIds.length; i++) {
      const nmId = allNmIds[i];
      if (groupColors.has(nmId)) continue; // already mapped

      let color = "";

      // Method A: nm_colors_names by index
      if (i < colorNames.length && colorNames[i]) {
        color = cap(colorNames[i]);
      }

      // Method B: vendor_code of the card that has this nm_id in its colors list
      if (!color) {
        for (const [otherArticle, otherCard] of cardsByArticle) {
          if (otherCard.colors && otherCard.colors.includes(nmId)) {
            const otherNames = (otherCard.nm_colors_names || "")
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean);
            const idx = otherCard.colors.indexOf(nmId);
            if (idx >= 0 && idx < otherNames.length && otherNames[idx]) {
              color = cap(otherNames[idx]);
              break;
            }
          }
        }
      }

      // Method C: vendor_code
      if (!color) {
        // Try to find which card has this nmId as the main article
        const ownCard = cardsByArticle.get(nmId);
        if (ownCard && ownCard.vendor_code) {
          color = colorFromVendorCode(ownCard.vendor_code);
        }
      }

      if (color) {
        groupColors.set(nmId, color);
        console.log(`  MAP imt:${imtId} nm:${nmId} → "${color}"`);
      } else {
        console.log(`  NOCOLOR imt:${imtId} nm:${nmId}`);
      }
    }
  }

  // Step 3: Assign colors to products
  for (const product of products) {
    const article = product.wbArticle;
    if (!article) continue;

    const card = cardsByArticle.get(article);
    if (!card) continue;

    // imtId
    const imtId = card.imt_id;
    product.imtId = imtId || undefined;

    // siblingIds - only those that exist in our catalog
    const allSiblingIds = card.colors || [];
    product.siblingIds = allSiblingIds.filter((nm) => articleMap.has(nm));

    // colorName - from imtGroupMap first, then vendor_code
    if (imtId && imtGroupMap.has(imtId)) {
      const group = imtGroupMap.get(imtId);
      product.colorName = group.get(article) || colorFromVendorCode(card.vendor_code) || "";
    } else {
      product.colorName = colorFromVendorCode(card.vendor_code) || "";
    }

    console.log(
      `SET ${product.id}: imt:${product.imtId} color:"${product.colorName}" siblings:${product.siblingIds.length}`
    );
  }

  // Step 4: Save
  fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(data, null, 2) + "\n", "utf-8");
  console.log(`\nDone! ${products.length} products processed`);
}

main().catch(console.error);
