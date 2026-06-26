/* =============================================
   Moranti — Seed Models
   Группирует варианты (цвета) в модели по размерам + материалу.
   Запуск: node prisma/seed-models.mjs
   ============================================= */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ─── Определение моделей ───
// Каждая модель: уникальный набор (категория + размеры + материал)
// id → список id товаров (вариантов)

const MODELS = [
  {
    id: "model-001",
    name: "Кросс-боди из кожи",
    slug: "crossbody-13x20",
    category: "crossbody",
    description: "Элегантная сумка-кроссбоди из натуральной кожи. Компактный размер 13×20×8 см, съёмный плечевой ремень, внутреннее отделение на молнии.",
    composition: "натуральная кожа",
    dimensions: "13×20×8 см",
    image: "",
    variantIds: ["mor-044"],
  },
  {
    id: "model-002",
    name: "Клатч из замши",
    slug: "crossbody-14x24",
    category: "crossbody",
    description: "Изящная сумка-клатч из натуральной замши. Тонкий силуэт 14×24×6 см, три отделения, съёмный ремень через плечо.",
    composition: "натуральная замша",
    dimensions: "14×24×6 см",
    image: "",
    variantIds: ["mor-002", "mor-021", "mor-030"],
  },
  {
    id: "model-003",
    name: "Кросс-боди малый",
    slug: "crossbody-15x23",
    category: "crossbody",
    description: "Лаконичная сумка через плечо из натуральной кожи. Универсальный размер 15×23×7 см, подходит для ежедневного использования. Внутренний карман на молнии, регулируемый ремень.",
    composition: "натуральная кожа",
    dimensions: "15×23×7 см",
    image: "",
    variantIds: ["mor-011", "mor-012", "mor-035"],
  },
  {
    id: "model-004",
    name: "Кросс-боди мини",
    slug: "crossbody-14x21",
    category: "crossbody",
    description: "Компактная сумка-кроссбоди из натуральной кожи. Размер 14×21×8 см, легкая и вместительная. Внутреннее отделение, регулируемый ремень.",
    composition: "натуральная кожа",
    dimensions: "14×21×8 см",
    image: "",
    variantIds: ["mor-017", "mor-056"],
  },
  {
    id: "model-005",
    name: "Кросс-боди средний",
    slug: "crossbody-17x27",
    category: "crossbody",
    description: "Просторная сумка через плечо из натуральной кожи. Размер 17×27×8 см — оптимальный для документов и планшета. Внутренний карман на молнии, регулируемый ремень.",
    composition: "натуральная кожа",
    dimensions: "17×27×8 см",
    image: "",
    variantIds: ["mor-022", "mor-040", "mor-047"],
  },
  {
    id: "model-006",
    name: "Тоут классический",
    slug: "tote-23x33",
    category: "tote",
    description: "Просторный тоут из натуральной замши. Размер 23×33×13 см, идеален для покупок и повседневного использования. Две ручки для ношения на плече.",
    composition: "натуральная замша",
    dimensions: "23×33×13 см",
    image: "",
    variantIds: ["mor-005", "mor-008", "mor-020"],
  },
  {
    id: "model-007",
    name: "Тоут большой",
    slug: "tote-30x45",
    category: "tote",
    description: "Вместительный тоут из натуральной кожи премиум-качества. Размер 30×45×14 см подходит для ноутбука и ежедневных вещей. Укреплённое дно, две ручки.",
    composition: "натуральная кожа 100%",
    dimensions: "30×45×14 см",
    image: "",
    variantIds: ["mor-010", "mor-013", "mor-027", "mor-037"],
  },
  {
    id: "model-008",
    name: "Мини-тоут",
    slug: "tote-22x21",
    category: "tote",
    description: "Компактный тоут из натуральной кожи. Размер 22×21×15 см, вместительное отделение, две ручки. Универсальная модель для города.",
    composition: "натуральная кожа",
    dimensions: "22×21×15 см",
    image: "",
    variantIds: ["mor-025", "mor-033"],
  },
  {
    id: "model-009",
    name: "Тоут макси",
    slug: "tote-31x44",
    category: "tote",
    description: "Большой тоут из натуральной замши. Размер 31×44×14 см, максимальная вместительность. Укреплённые ручки, внутренний карман.",
    composition: "натуральная замша",
    dimensions: "31×44×14 см",
    image: "",
    variantIds: ["mor-004", "mor-036"],
  },
  {
    id: "model-010",
    name: "Багет из замши",
    slug: "baguette-17x25",
    category: "baguette",
    description: "Сумка-багет из натуральной замши. Размер 17×25×8 см, элегантный вытянутый силуэт. Съёмный ремень через плечо.",
    composition: "натуральная замша",
    dimensions: "17×25×8 см",
    image: "",
    variantIds: ["mor-015", "mor-026"],
  },
  {
    id: "model-011",
    name: "Багет удлинённый",
    slug: "baguette-16x30",
    category: "baguette",
    description: "Элегантная сумка-багет из натуральной кожи. Размер 16×30×9 см, удлинённая форма. Внутреннее отделение на молнии, съёмный ремень.",
    composition: "натуральная кожа",
    dimensions: "16×30×9 см",
    image: "",
    variantIds: ["mor-029", "mor-031", "mor-045"],
  },
  {
    id: "model-012",
    name: "Багет широкий",
    slug: "baguette-17x28",
    category: "baguette",
    description: "Сумка-багет из натуральной кожи. Размер 17×28×7 см, тонкий профиль. Съёмный регулируемый ремень через плечо.",
    composition: "натуральная кожа",
    dimensions: "17×28×7 см",
    image: "",
    variantIds: ["mor-024", "mor-042"],
  },
  {
    id: "model-013",
    name: "Седло классическое",
    slug: "saddle-22x28",
    category: "saddle",
    description: "Сумка-седло из натуральной кожи. Размер 22×28×12 см, характерная изогнутая форма. Внутреннее отделение, съёмный ремень.",
    composition: "натуральная кожа",
    dimensions: "22×28×12 см",
    image: "",
    variantIds: ["mor-007", "mor-028", "mor-048"],
  },
  {
    id: "model-014",
    name: "Рюкзак большой",
    slug: "backpack-43x37",
    category: "backpack",
    description: "Просторный рюкзак из натуральной кожи. Размер 43×37×10 см, два отделения на молнии. Удобные лямки, подходит для учебы и работы.",
    composition: "натуральная кожа 100%",
    dimensions: "43×37×10 см",
    image: "",
    variantIds: ["mor-014", "mor-018", "mor-049"],
  },
  {
    id: "model-015",
    name: "Кросс-боди нано",
    slug: "crossbody-13x21",
    category: "crossbody",
    description: "Миниатюрная кросс-боди из натуральной кожи премиум-качества. Размер 13×21.5×6 см, лёгкая и компактная.",
    composition: "натуральная кожа 100%",
    dimensions: "13×21.5×6 см",
    image: "",
    variantIds: ["mor-046", "mor-050"],
  },
  {
    id: "model-016",
    name: "Кросс-боди М",
    slug: "crossbody-15x26",
    category: "crossbody",
    description: "Элегантная кросс-боди из натуральной кожи премиум-качества. Размер 15×26×7 см, внутреннее отделение на молнии.",
    composition: "натуральная кожа 100%",
    dimensions: "15×26×7 см",
    image: "",
    variantIds: ["mor-052", "mor-054"],
  },
  {
    id: "model-017",
    name: "Сумка на плечо",
    slug: "na-plecho-19x27",
    category: "na-plecho",
    description: "Сумка на плечо из натуральной кожи. Размер 19×27×5.5 см, лаконичный дизайн. Внутреннее отделение на молнии.",
    composition: "натуральная кожа",
    dimensions: "19×27×5.5 см",
    image: "",
    variantIds: ["mor-038", "mor-055"],
  },
  {
    id: "model-018",
    name: "Сумка на плечо из замши",
    slug: "na-plecho-19x27-suede",
    category: "na-plecho",
    description: "Сумка на плечо из натуральной замши. Размер 19×27×5.5 см, мягкая текстура. Внутреннее отделение на молнии.",
    composition: "натуральная замша",
    dimensions: "19×27×5.5 см",
    image: "",
    variantIds: ["mor-053"],
  },
  {
    id: "model-019",
    name: "Багет из кожи большой",
    slug: "baguette-19x33",
    category: "baguette",
    description: "Просторная сумка-багет из натуральной кожи. Размер 19×33×12 см, увесистый силуэт. Внутреннее отделение на молнии, съёмный ремень.",
    composition: "натуральная кожа",
    dimensions: "19×33×12 см",
    image: "",
    variantIds: ["mor-041"],
  },
  {
    id: "model-020",
    name: "Багет из кожи",
    slug: "baguette-17x25-leather",
    category: "baguette",
    description: "Сумка-багет из натуральной кожи. Размер 17×25×8 см, элегантный вытянутый силуэт. Съёмный ремень через плечо.",
    composition: "натуральная кожа",
    dimensions: "17×25×8 см",
    image: "",
    variantIds: ["mor-006"],
  },
  {
    id: "model-021",
    name: "Тоут из замши большой",
    slug: "tote-24x52",
    category: "tote",
    description: "Большой тоут из натуральной замши. Размер 24×52×16 см, максимальная вместительность. Укреплённые ручки.",
    composition: "натуральная замша",
    dimensions: "24×52×16 см",
    image: "",
    variantIds: ["mor-058"],
  },
  {
    id: "model-022",
    name: "Рюкзак малый",
    slug: "backpack-37x43",
    category: "backpack",
    description: "Рюкзак из натуральной кожи. Размер 37×43×10 см, два отделения. Удобные лямки.",
    composition: "натуральная кожа 100%",
    dimensions: "37×43×10 см",
    image: "",
    variantIds: ["mor-051"],
  },
  {
    id: "model-023",
    name: "Кросс-боди оригинальный",
    slug: "crossbody-13x24",
    category: "crossbody",
    description: "Сумка кросс-боди из натуральной кожи. Размер 13×24×11 см, три отделения, каркасная форма. Съёмный ремень, пряжка.",
    composition: "натуральная кожа",
    dimensions: "13×24×11 см",
    image: "",
    variantIds: ["mor-001"],
  },
  {
    id: "model-024",
    name: "Вечерний кросс-боди",
    slug: "evening-crossbody",
    category: "crossbody",
    description: "Вечерняя сумка кросс-боди из натуральной кожи. Лаконичный дизайн для особых случаев.",
    composition: null,
    dimensions: null,
    image: "",
    variantIds: ["mor-003"],
  },
  {
    id: "model-025",
    name: "Багет белый",
    slug: "white-baguette",
    category: "baguette",
    description: "Сумка-багет из натуральной кожи белого цвета. Элегантный дизайн.",
    composition: "натуральная кожа",
    dimensions: null,
    image: "",
    variantIds: ["mor-023"],
  },
  {
    id: "model-026",
    name: "Кросс-боди L",
    slug: "crossbody-19x29",
    category: "crossbody",
    description: "Сумка кросс-боди из натуральной кожи. Размер 19×29×8 см.",
    composition: "натуральная кожа",
    dimensions: "19×29×8 см",
    image: "",
    variantIds: ["mor-039"],
  },
  {
    id: "model-027",
    name: "Кросс-боди из замши",
    slug: "crossbody-13x20-suede",
    category: "crossbody",
    description: "Сумка кросс-боди из натуральной замши. Размер 13×20×8 см, мягкая текстура.",
    composition: "натуральная замша",
    dimensions: "13×20×8 см",
    image: "",
    variantIds: ["mor-019"],
  },
  {
    id: "model-028",
    name: "Тоут из замши компактный",
    slug: "tote-22x21-suede",
    category: "tote",
    description: "Компактный тоут из натуральной замши. Размер 22×21×15 см.",
    composition: "натуральная замша",
    dimensions: "22×21×15 см",
    image: "",
    variantIds: ["mor-043"],
  },
];

async function main() {
  console.log("Seeding models...\n");

  // ─── 1. Create/update models ───
  for (const m of MODELS) {
    const { variantIds, ...modelData } = m;

    await prisma.model.upsert({
      where: { id: m.id },
      update: modelData,
      create: modelData,
    });

    // ─── 2. Link variants to model ───
    for (const vid of variantIds) {
      const existing = await prisma.product.findUnique({ where: { id: vid } });
      if (!existing) {
        console.log(`  ⚠ Variant ${vid} not found, skipping`);
        continue;
      }

      await prisma.product.update({
        where: { id: vid },
        data: { modelId: m.id },
      });
      console.log(`  ✓ ${vid} → ${m.id} (${m.name})`);
    }
  }

  // ─── 3. Show summary ───
  const totalModels = await prisma.model.count();
  const linkedVariants = await prisma.product.count({ where: { NOT: { modelId: null } } });
  const unlinkedVariants = await prisma.product.count({ where: { modelId: null } });

  console.log(`\nDone: ${totalModels} models, ${linkedVariants} variants linked, ${unlinkedVariants} unlinked`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
