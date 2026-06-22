/**
 * Маппинг WB subject ID → категории Moranti (6 штук).
 *
 * WB subject_id берётся из card.wb.ru (subj_id / subjectId)
 * или из Content API (subjectID).
 */

/** @type {Record<number, string>} */
const CATEGORY_MAP = {
  // Клатчи, сумки через плечо → crossbody
  1: "crossbody",   // Сумки женские
  7: "crossbody",   // Клатчи
  25: "crossbody",  // Сумки-кросс-боди

  // Сумки на плечо
  2: "na-plecho",   // Сумки на плечо

  // Багеты
  8: "baguette",    // Сумки-багет

  // Тоуты, шоперы
  3: "tote",        // Шоперы, сумки для ноутбука

  // Сёдла
  6: "saddle",      // Сумки-седло

  // Рюкзаки
  5: "backpack",    // Рюкзаки
};

/** @type {Record<string, string>} */
const NAME_FALLBACK = {
  кросс: "crossbody",
  клатч: "crossbody",
  плеч: "na-plecho",
  багет: "baguette",
  тоут: "tote",
  шопер: "tote",
  седл: "saddle",
  рюкзак: "backpack",
};

/** @type {Record<string, string>} */
const CATEGORY_RU = {
  crossbody: "Кросс-боди",
  "na-plecho": "На плечо",
  baguette: "Багет",
  tote: "Тоут",
  saddle: "Седло",
  backpack: "Рюкзак",
};

/**
 * Определяет категорию Moranti по subject ID и subject name.
 * @param {number|undefined} subjectId
 * @param {string} [subjectName]
 * @returns {string}
 */
function wbToCategory(subjectId, subjectName) {
  if (subjectId && CATEGORY_MAP[subjectId]) {
    return CATEGORY_MAP[subjectId];
  }

  // Fallback по названию
  if (subjectName) {
    const lower = subjectName.toLowerCase();
    for (const [keyword, cat] of Object.entries(NAME_FALLBACK)) {
      if (lower.includes(keyword)) return cat;
    }
  }

  // Если ничего не подошло — crossbody (самая частая)
  return "crossbody";
}

module.exports = { CATEGORY_MAP, CATEGORY_RU, wbToCategory };
