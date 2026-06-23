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
 * Приоритет: subjId (из card.json) → subjectId (из seller API) → название.
 *
 * @param {number|undefined} subjectId — subjectId из seller API (общий, часто 50)
 * @param {string} [subjectName] — название подкатегории (subj_name из card.json)
 * @param {number} [subjId] — точный subj_id из card.json (1, 2, 7, 8…)
 * @returns {string}
 */
function wbToCategory(subjectId, subjectName, subjId) {
  // 1) Точный subj_id из card.json (самый надёжный)
  if (subjId && CATEGORY_MAP[subjId]) {
    return CATEGORY_MAP[subjId];
  }

  // 2) subjectId из seller API
  if (subjectId && CATEGORY_MAP[subjectId]) {
    return CATEGORY_MAP[subjectId];
  }

  // 3) Fallback по названию
  if (subjectName) {
    const lower = subjectName.toLowerCase();
    for (const [keyword, cat] of Object.entries(NAME_FALLBACK)) {
      if (lower.includes(keyword)) return cat;
    }
  }

  // 4) Если ничего не подошло — crossbody (самая частая)
  return "crossbody";
}

module.exports = { CATEGORY_MAP, CATEGORY_RU, wbToCategory };
