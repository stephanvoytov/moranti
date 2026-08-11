/**
 * llms.txt — стандарт (llmstxt.org) для описания сайта LLM-агентам.
 * Отдаётся как text/plain по адресу /llms.txt.
 * SITE_URL подставляется динамически (prod/dev различаются).
 */
export function GET(): Response {
  const siteUrl = process.env.SITE_URL || "http://localhost:3001";

  const lines = [
    "# Moranti",
    "",
    "> Премиальный каталог кожаных сумок ручной работы: кросс-боди, тоуты, багеты, седла и рюкзаки из натуральной кожи и замши. Доставка по России.",
    "",
    "## Key pages",
    `- [Каталог](${siteUrl}/catalog): Все модели сумок`,
    `- [Кросс-боди](${siteUrl}/catalog/crossbody): Сумки кросс-боди из натуральной кожи`,
    `- [На плечо](${siteUrl}/catalog/na-plecho): Сумки на плечо`,
    `- [Багет](${siteUrl}/catalog/baguette): Сумки-багет из кожи и замши`,
    `- [Тоут](${siteUrl}/catalog/tote): Сумки-тоуты`,
    `- [Седло](${siteUrl}/catalog/saddle): Сумки-седло`,
    `- [Рюкзаки](${siteUrl}/catalog/backpack): Кожаные рюкзаки`,
    `- [Уход за сумками](${siteUrl}/care): Как ухаживать за изделиями`,
    `- [Доставка](${siteUrl}/delivery): Доставка и оплата`,
    `- [Контакты](${siteUrl}/contacts): Связаться с нами`,
    "",
    "## Optional",
    `- [Политика конфиденциальности](${siteUrl}/privacy)`,
    "",
  ];

  return new Response(lines.join("\n"), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}

export const dynamic = "force-static";
