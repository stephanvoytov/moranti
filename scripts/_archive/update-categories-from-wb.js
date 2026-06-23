/**
 * Скрипт: обновление категорий товаров по данным фильтров WB
 * 
 * Данные собраны вручную через браузер:
 * - страница продавца: https://www.wildberries.ru/seller/312222
 * - фильтр "Модель сумки" (char: f59122)
 */

const fs = require('fs');
const path = require('path');

// === WB FILTER DATA ===

const wbCategories = {
  'crossbody': {
    name: 'Кросс-боди',
    description: 'Сумки через плечо из натуральной кожи и замши',
    filterId: 121288,
    articles: [
      165436665, 185673251, 226023435, 226024975, 226025376,
      253051367, 253053689, 391176745, 391198267, 445414843,
      577159834, 584837180, 584838455, 584839195, 899371733,
      899375103, 969189657, 969253912, 969257682, 969260081,
      969265618
    ]
  },
  'na-plecho': {
    name: 'На плечо',
    description: 'Сумки на плечо из натуральной кожи и замши',
    filterId: 66114,
    articles: [
      969020680, 969025312
    ]
  },
  'baguette': {
    name: 'Багет',
    description: 'Актуальные сумки-багет',
    filterId: 536008,
    articles: [
      165436666, 253033047, 391159701, 425312758, 462984217,
      584856106, 584857819, 969178673
    ]
  },
  'tote': {
    name: 'Тоут',
    description: 'Просторные сумки из натуральной кожи и замши',
    filterId: 477557,
    articles: [
      328031735, 328035699, 463001457, 584864653, 584878143,
      584881064, 584882297, 899355983
    ]
  },
  'saddle': {
    name: 'Седло',
    description: 'Сумки формы «седло»',
    filterId: 464080,
    articles: [
      226020314, 261294903, 462993756
    ]
  }
};

// Build reverse map: wbArticle -> category slug
const articleToCategory = {};
for (const [slug, cat] of Object.entries(wbCategories)) {
  for (const article of cat.articles) {
    if (articleToCategory[article]) {
      console.warn(`⚠ Артикул ${article} найден в нескольких категориях: ${articleToCategory[article]} и ${slug}`);
    }
    articleToCategory[article] = slug;
  }
}

// === READ PRODUCTS ===

const productsPath = path.join(__dirname, '..', 'data', 'products.json');
const raw = fs.readFileSync(productsPath, 'utf-8');
const data = JSON.parse(raw);

const oldCategories = [...data.categories];
const oldCounts = {};
for (const c of oldCategories) {
  oldCounts[c.slug] = c.count;
}

// Stats
let changed = 0;
let unchanged = 0;
let notFound = 0;
const newCounts = {};

// New categories definition (5 WB-based categories)
const newCategories = [
  { slug: 'crossbody', name: 'Кросс-боди', description: 'Сумки через плечо из натуральной кожи и замши' },
  { slug: 'na-plecho', name: 'На плечо', description: 'Сумки на плечо из натуральной кожи и замши' },
  { slug: 'baguette', name: 'Багет', description: 'Актуальные сумки-багет' },
  { slug: 'tote', name: 'Тоут', description: 'Просторные сумки из натуральной кожи и замши' },
  { slug: 'saddle', name: 'Седло', description: 'Сумки формы «седло»' }
];

for (const product of data.products) {
  const wbArticle = product.wbArticle;
  const newCategory = articleToCategory[wbArticle];

  if (newCategory) {
    if (product.category !== newCategory) {
      console.log(`📦 ${product.id} (wb:${wbArticle}): ${product.category} → ${newCategory}`);
      product.category = newCategory;
      changed++;
    } else {
      unchanged++;
    }
    newCounts[newCategory] = (newCounts[newCategory] || 0) + 1;
  } else {
    // Not found in any WB filter — keep existing category
    console.log(`❓ ${product.id} (wb:${wbArticle}): не найден в фильтрах WB, оставлено "${product.category}"`);
    notFound++;
    newCounts[product.category] = (newCounts[product.category] || 0) + 1;
  }
}

// Update categories metadata
data.categories = newCategories.map(c => ({
  ...c,
  count: newCounts[c.slug] || 0,
  image: `/images/category-${c.slug}.jpg`
}));

// Handle any products with old categories that still exist (add them as extra)
for (const [slug, count] of Object.entries(newCounts)) {
  if (!newCategories.find(c => c.slug === slug)) {
    // Old category with remaining products
    const oldCat = oldCategories.find(c => c.slug === slug);
    if (oldCat && count > 0) {
      data.categories.push({
        slug: oldCat.slug,
        name: oldCat.name,
        description: oldCat.description,
        image: oldCat.image || `/images/category-${oldCat.slug}.jpg`,
        count
      });
    }
  }
}

// Update meta
data.meta.lastModified = new Date().toISOString().split('T')[0];

// === WRITE ===

fs.writeFileSync(productsPath, JSON.stringify(data, null, 2), 'utf-8');

console.log('\n=== РЕЗУЛЬТАТ ===');
console.log(`Изменено: ${changed}`);
console.log(`Без изменений: ${unchanged}`);
console.log(`Не найдено в WB: ${notFound}`);
console.log('\nНовые counts по категориям:');
for (const c of data.categories) {
  const old = oldCounts[c.slug] || 0;
  console.log(`  ${c.slug}: ${old} → ${c.count}`);
}
console.log('\n✅ Готово!');
