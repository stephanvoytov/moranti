/* =============================================
   Moranti — Media usage lookup
   Ищет, где используется URL изображения:
   настройки (hero, категории), товары, модели.
   Нужно перед удалением файла из медиа-хранилища,
   чтобы не сломать витрину.
   ============================================= */

import prisma, { prismaQuery } from "@/lib/prisma";
import { readSettings } from "@/lib/settings";

export interface MediaUsage {
  /** Человекочитаемое описание места использования */
  where: string;
  /** Slug сущности (товара/модели/категории), если есть */
  slug?: string;
}

export async function findMediaUsage(url: string): Promise<MediaUsage[]> {
  const usages: MediaUsage[] = [];

  // Настройки: hero-картинка + фото категорий
  try {
    const settings = await readSettings();
    if (settings.hero.image === url) {
      usages.push({ where: "Настройки — hero-картинка" });
    }
    for (const [slug, img] of Object.entries(settings.categoryImages)) {
      if (img === url) {
        usages.push({ where: "Настройки — фото категории", slug });
      }
    }
  } catch {
    // БД недоступна — пропускаем проверку настроек (не блокируем удаление)
  }

  // Товары: витринное фото, галерея, ozon-фото
  try {
    const products = await prismaQuery(() =>
      prisma.product.findMany({
        where: {
          OR: [
            { image: url },
            { images: { has: url } },
            { ozonImage: url },
            { ozonImages: { has: url } },
          ],
        },
        select: { slug: true, name: true },
      }),
    );
    for (const p of products) {
      usages.push({ where: `Товар «${p.name}»`, slug: p.slug });
    }
  } catch {
    // БД недоступна — пропускаем
  }

  // Модели: фото модели
  try {
    const models = await prismaQuery(() =>
      prisma.model.findMany({
        where: { image: url },
        select: { slug: true, name: true },
      }),
    );
    for (const m of models) {
      usages.push({ where: `Модель «${m.name}»`, slug: m.slug });
    }
  } catch {
    // БД недоступна — пропускаем
  }

  return usages;
}