import { getPayload } from 'payload'
import { NextResponse } from 'next/server'
import { Client } from 'pg'
import config from '@payload-config'
import { textToRichText, blocksToRichText } from '@/lib/richtext'

export const dynamic = 'force-dynamic'

const CATEGORY_INFO: Record<string, { name: string; description: string }> = {
  crossbody: { name: 'Кросс-боди', description: 'Сумки через плечо' },
  'na-plecho': { name: 'На плечо', description: 'Сумки на плечо' },
  baguette: { name: 'Багет', description: 'Сумки-багет' },
  tote: { name: 'Тоут', description: 'Шоперы и тоуты' },
  saddle: { name: 'Седло', description: 'Сумки-седло' },
  backpack: { name: 'Рюкзак', description: 'Рюкзаки' },
}

function flattenCharacteristics(raw: any): { key: string; value: string }[] {
  if (!Array.isArray(raw)) return []
  const out: { key: string; value: string }[] = []
  for (const group of raw) {
    const opts = Array.isArray(group?.options) ? group.options : []
    for (const o of opts) {
      if (o?.name != null) out.push({ key: String(o.name), value: String(o.value ?? '') })
    }
  }
  return out
}

function truncate(s: string | null | undefined, n = 220): string {
  if (!s) return ''
  s = String(s).replace(/\s+/g, ' ').trim()
  return s.length > n ? s.slice(0, n).trimEnd() + '…' : s
}

async function getLegacyRows() {
  const c = new Client({ connectionString: process.env.DATABASE_URL })
  await c.connect()
  const products = (await c.query('SELECT * FROM "Product"')).rows
  const models = (await c.query('SELECT * FROM "Model"')).rows
  await c.end()
  return { products, models }
}

export async function GET() {
  const payload = await getPayload({ config })
  const { products: legacyProducts, models: legacyModels } = await getLegacyRows()

  // ---- CATEGORIES (from distinct product.category) ----
  const catSlugs = Array.from(
    new Set(legacyProducts.map((p: any) => p.category).filter(Boolean)),
  ) as string[]
  const categoryMap: Record<string, string> = {}
  for (const slug of catSlugs) {
    const info = CATEGORY_INFO[slug] || { name: slug, description: '' }
    const existing = await payload.find({
      collection: 'categories',
      where: { slug: { equals: slug } },
      limit: 1,
      overrideAccess: true,
    })
    const data = {
      name: info.name,
      slug,
      description: info.description,
      image: `/images/categories/${slug}.jpg`,
    }
    if (existing.totalDocs > 0) {
      await payload.update({ collection: 'categories', id: existing.docs[0].id, data, overrideAccess: true })
      categoryMap[slug] = existing.docs[0].id as string
    } else {
      const created = await payload.create({ collection: 'categories', data, overrideAccess: true })
      categoryMap[slug] = created.id as string
    }
  }

  // ---- MODELS ----
  const modelMap: Record<string, string> = {}
  for (const m of legacyModels) {
    const slug = m.slug || m.id
    const image = typeof m.image === 'string' ? m.image : ''
    const gallery = image ? [{ image, alt: m.name }] : []
    const data = {
      name: m.name || slug,
      slug,
      category: m.category ? categoryMap[m.category] || null : null,
      imtId: typeof m.imtId === 'number' ? m.imtId : null,
      description: m.description || null,
      composition: m.composition || null,
      image,
      gallery,
    }
    const existing = await payload.find({
      collection: 'models',
      where: { slug: { equals: slug } },
      limit: 1,
      overrideAccess: true,
    })
    if (existing.totalDocs > 0) {
      await payload.update({ collection: 'models', id: existing.docs[0].id, data, overrideAccess: true })
      modelMap[slug] = existing.docs[0].id as string
    } else {
      const created = await payload.create({ collection: 'models', data, overrideAccess: true })
      modelMap[slug] = created.id as string
    }
  }

  // ---- PRODUCTS (marketplace-only) ----
  let productsUpserted = 0
  for (const p of legacyProducts) {
    const image = typeof p.image === 'string' ? p.image : ''
    const images: string[] = Array.isArray(p.images) ? p.images : []
    const gallery = (image ? [image, ...images] : images).slice(0, 18).map((u) => ({ image: u, alt: p.name }))
    const characteristics = flattenCharacteristics(p.characteristics)
    const modelDocId = p.modelId ? modelMap[p.modelId] || null : null

    const data: any = {
      name: p.name || 'Без названия',
      slug: p.slug,
      sku: p.sku || p.id,
      category: p.category ? categoryMap[p.category] || null : null,
      status: 'published',
      isDirectSale: false,
      directPrice: 0,
      price: typeof p.price === 'number' ? p.price : 0,
      originalPrice: typeof p.originalPrice === 'number' ? p.originalPrice : 0,
      currency: p.currency || '₽',
      inStock: p.inStock ?? true,
      wbStock: typeof p.wbStock === 'number' ? p.wbStock : p.wbArticle ? 10 : 0,
      ozonStock: typeof p.ozonStock === 'number' ? p.ozonStock : p.ozonArticle ? 10 : 0,
      stockQuantity: 0,
      shortDescription: truncate(p.description),
      description: textToRichText(p.description),
      colorName: p.colorName || null,
      composition: p.composition || null,
      rating: typeof p.rating === 'number' ? p.rating : null,
      reviewsCount: typeof p.reviewsCount === 'number' ? p.reviewsCount : null,
      salesCount: typeof p.salesCount === 'number' ? p.salesCount : null,
      image,
      gallery,
      video: typeof p.video === 'string' ? p.video : null,
      characteristics,
      wbArticle: p.wbArticle ?? null,
      ozonArticle: p.ozonArticle ?? null,
      wbPrice: p.wbPrice ?? null,
      ozonPrice: p.ozonPrice ?? null,
      wbOriginalPrice: p.wbOriginalPrice ?? null,
      ozonOriginalPrice: p.ozonOriginalPrice ?? null,
      model: modelDocId,
    }

    const existing = await payload.find({
      collection: 'products',
      where: { slug: { equals: p.slug } },
      limit: 1,
      overrideAccess: true,
    })
    if (existing.totalDocs > 0) {
      await payload.update({ collection: 'products', id: existing.docs[0].id, data, overrideAccess: true })
    } else {
      await payload.create({ collection: 'products', data, overrideAccess: true })
    }
    productsUpserted++
  }

  // ---- TEST DIRECT-SALE PRODUCTS: удалены (мусор в каталоге) ----
  const testCreated = 0

  // ---- SITE SETTINGS (fresh start — no legacy data) ----
  // Всё переразрабатывается заново: старые настройки из прошлой админки не переносим.
  // Удаляем существующие и создаём чистый дефолт (без старых hero/social/apiKeys).
  const existingSettings = await payload.find({ collection: 'site-settings', limit: 100, overrideAccess: true })
  for (const s of existingSettings.docs) {
    await payload.delete({ collection: 'site-settings', id: s.id, overrideAccess: true })
  }
  await payload.create({
    collection: 'site-settings',
    data: { storeName: 'Moranti', contactEmail: '', currency: '₽' },
    overrideAccess: true,
  })
  const settingsStatus = 'reset-fresh'

  // ---- DEFAULT PAGES (блочный редактор, контент как на оригинальном сайте) ----
  const defaultPages = [
    {
      slug: 'home',
      title: 'Главная',
      layout: [
        {
          blockType: 'statement',
          text: 'Эксклюзивные кожаные сумки ручной работы',
          paragraphs: 'Moranti — это авторские сумки из натуральной итальянской кожи. Мы создаём аксессуары, которые не выходят из моды: продуманный крой, честные материалы и внимание к деталям.\n\nРаботаем с кожей премиум-класса, шьём малыми партиями и лично проверяем каждую сумку перед отправкой.',
        },
      ],
    },
    {
      slug: 'o-nas',
      title: 'О бренде',
      layout: [
        {
          blockType: 'hero',
          eyebrow: 'Moranti',
          title: 'Сумки, которые остаются актуальными',
          subtitle: 'Натуральная итальянская кожа. Сдержанные формы. Ручная работа и внимание к деталям.\n\nMoranti — это сумки для тех, кто ценит качество материалов, выразительную форму и вещи, которые легко становятся частью повседневного гардероба.',
          imageUrl: '/about/bag-4.jpg',
          imageCaption: 'Italian leather · Handcrafted · Made in Italy',
        },
        {
          blockType: 'statement',
          text: 'Не следуем трендам.\nВыбираем форму,\nкоторая остаётся.',
          paragraphs: 'Мы создаём Moranti вокруг идеи вневременного дизайна. Чистые линии, спокойные оттенки и натуральные материалы позволяют сумкам легко сочетаться с разными образами — сегодня, в следующем сезоне и спустя годы.\n\nМы не стремимся сделать вещь заметной любой ценой. Нам важнее создать форму, к которой хочется возвращаться.',
          imageUrl: '/about/bag-2.jpg',
        },
        {
          blockType: 'section',
          title: 'Итальянская кожа — в основе каждой Moranti',
          paragraphs: 'Каждая сумка Moranti изготавливается в Италии из натуральной кожи и замши.\n\nМы тщательно выбираем материалы и обращаем внимание на их фактуру, плотность и тактильные свойства. Натуральная кожа со временем меняется: становится мягче, приобретает глубину цвета и характер, сохраняя свою естественную красоту.',
          items: [],
        },
        {
          blockType: 'images',
          images: [
            { imageUrl: '/about/bag-1.jpg', caption: 'Natural leather — тактильность · долговечность · характер' },
          ],
        },
        {
          blockType: 'section',
          number: '01',
          title: 'Ручная работа — внимание к каждой детали',
          paragraphs: 'Сумки Moranti собираются вручную. Мы уделяем особое внимание тому, что формирует качество вещи: аккуратности швов, обработке кожи, фурнитуре, соединению деталей и посадке элементов.\n\nДля нас ручная работа — не просто способ производства. Это возможность контролировать детали, которые невозможно оценить по фотографии, но которые чувствуются каждый раз, когда вы берёте сумку в руки.',
          items: [],
        },
        {
          blockType: 'statement',
          text: 'Хорошая сумка —\nэто не только форма.',
          paragraphs: 'Внешний силуэт — только начало. Мы продумываем то, как сумка открывается, как лежит на плече, насколько удобно расположены ручки, ремни, карманы и внутренние отделения. Фурнитура, швы, подкладка и каждая линия конструкции должны работать вместе, чтобы сумкой было удобно пользоваться каждый день.',
        },
        {
          blockType: 'images',
          images: [
            { imageUrl: '/about/bag-3.jpg', caption: '' },
            { imageUrl: '/about/bag-5.jpg', caption: '' },
            { imageUrl: '/about/bag-6.jpg', caption: '' },
          ],
        },
        {
          blockType: 'cards',
          title: 'Для разных дней. В одном стиле.',
          cards: [
            { name: 'Город', subtitle: 'Кросс-боди · небольшая сумка', text: 'Для дней, когда нужно взять главное и двигаться дальше.', href: '/catalog/crossbody' },
            { name: 'Работа', subtitle: 'Тоут · шопер', text: 'Вместительное пространство для всего, что должно быть под рукой.', href: '/catalog/tote' },
            { name: 'Вечер', subtitle: 'Багет · компактная модель', text: 'Минимум лишнего. Выразительный силуэт.', href: '/catalog/baguette' },
          ],
          outro: 'Разные формы и сценарии — единый подход к качеству и эстетике Moranti.',
        },
        {
          blockType: 'statement',
          text: 'Moranti — вещи, которые остаются.',
          paragraphs: 'Мы верим в дизайн, который не зависит от одного сезона. В натуральные материалы, которые красиво стареют. В ручную работу, которую можно почувствовать. В продуманные формы, которые легко вписываются в разные образы.\n\nMoranti создаётся для того, чтобы сумка была не просто аксессуаром, а вещью, к которой хочется возвращаться.',
        },
        {
          blockType: 'cta',
          title: 'Найдите свою Moranti',
          text: 'Откройте коллекцию и выберите сумку, которая станет частью вашего повседневного стиля.',
          buttons: [
            { label: 'Смотреть коллекцию →', href: '/catalog', style: 'primary' },
            { label: 'Доставка и оплата', href: '/delivery', style: 'secondary' },
          ],
        },
      ],
    },
    {
      slug: 'uxod-za-sumkami',
      title: 'Уход за сумками',
      layout: [
        {
          blockType: 'hero',
          title: 'Уход за сумками',
          subtitle: 'Натуральная кожа и замша — материалы, которые живут и стареют красиво. Правильный уход сохранит их первозданный вид на долгие годы.',
        },
        {
          blockType: 'section',
          number: '01',
          title: 'Гладкая и зернистая кожа',
          paragraphs: 'Большинство сумок Moranti изготавливается из итальянской натуральной кожи — гладкой или с зернистой фактурой. Это плотный, износостойкий материал, который при минимальном уходе сохраняет форму и цвет годами.\n\nПыль и лёгкие загрязнения удаляйте мягкой сухой тканью. Для более тщательной очистки используйте мусс или пену для натуральной кожи — нанесите на салфетку, а не на само изделие.\n\nЕсли сумка намокла под дождём или снегом, промокните поверхность мягкой тканью и дайте высохнуть при комнатной температуре — вдали от батарей и прямых солнечных лучей. Не используйте фен.',
          items: [],
        },
        {
          blockType: 'section',
          number: '02',
          title: 'Замша',
          paragraphs: 'Замша — благородный, но более капризный материал. Итальянская замша, которую мы используем, отличается мягкостью и бархатистой фактурой, но требует бережного отношения.\n\nРегулярно проходитесь по поверхности специальной щёткой для замши — это убирает пыль и поднимает ворс. Для выведения пятен используйте ластик для замши или специальную пену. Жирные пятна аккуратно присыпьте тальком, оставьте на несколько часов, затем стряхните и расчешите ворс.\n\nИзбегайте контакта замши с водой. Для защиты от влаги используйте водоотталкивающий спрей для замши и нубука — наносите его сразу после покупки и обновляйте каждые несколько недель.',
          items: [],
        },
        {
          blockType: 'section',
          number: '03',
          title: 'Хранение',
          paragraphs: 'Каждая сумка Moranti поставляется с пылевым мешком. Используйте его для хранения — ткань пропускает воздух, в отличие от полиэтилена, и защищает от пыли.',
          items: [
            { text: 'Наполните сумку мягкой бумагой или тканью — это сохранит форму' },
            { text: 'Храните в сухом месте при комнатной температуре' },
            { text: 'Держите вдали от батарей, обогревателей и прямых солнечных лучей' },
            { text: 'Не кладите тяжёлые предметы сверху на сумку' },
            { text: 'Металлическую фурнитуру можно протирать сухой мягкой тканью' },
          ],
        },
      ],
    },
    {
      slug: 'dostavka-i-oplata',
      title: 'Доставка',
      layout: [
        {
          blockType: 'hero',
          title: 'Доставка',
          subtitle: 'Все сумки Moranti представлены на Wildberries и Ozon. Заказ оформляется напрямую на маркетплейсе — доставка, оплата и возврат регулируются правилами площадки.',
        },
        {
          blockType: 'section',
          number: '01',
          title: 'Как заказать',
          paragraphs: 'Выберите модель в каталоге и перейдите на Wildberries или Ozon. Каждая сумка поставляется в фирменной коробке с пылевым мешком. Отправка осуществляется в течение 1–2 рабочих дней.',
          items: [],
        },
        {
          blockType: 'section',
          number: '02',
          title: 'Доставка и оплата',
          paragraphs: 'Доставка осуществляется по всей России через пункты выдачи, постаматы или курьером. Срок — от 3 до 7 дней. Стоимость рассчитывается маркетплейсом при оформлении заказа.\n\nОплата — картами, Apple Pay, Google Pay, СБП, наличными — через защищённые каналы маркетплейса. Все вопросы по оплате и доставке решаются через поддержку площадки.',
          items: [],
        },
        {
          blockType: 'section',
          number: '03',
          title: 'Возврат',
          paragraphs: 'Возврат принимается в течение 14 дней. Сумка должна быть в оригинальной упаковке, без следов использования, с сохранением бирок и пылевого мешка. Оформляется через личный кабинет маркетплейса.',
          items: [],
        },
      ],
    },
    {
      slug: 'kontakty',
      title: 'Контакты',
      layout: [
        {
          blockType: 'hero',
          title: 'Контакты',
          subtitle: 'Вопросы по заказам, возвратам и качеству изделий — напишите нам, ответим на вашу почту.',
        },
        {
          blockType: 'section',
          title: 'Связь',
          paragraphs: 'Расскажите, что интересует — и оставьте email для ответа в форме ниже. Письмо придёт напрямую владельцу магазина.',
          items: [],
        },
      ],
    },
    {
      slug: 'garantiya-i-vozvrat',
      title: 'Гарантия и возврат',
      layout: [
        {
          blockType: 'hero',
          title: 'Гарантия и возврат',
          subtitle: 'Даём гарантию на все изделия из натуральной кожи. Если товар не подошёл — примем возврат в течение 14 дней.',
        },
        {
          blockType: 'section',
          title: 'Уход за кожей',
          paragraphs: 'Используйте специальные средства для кожи, берегите от прямых солнечных лучей и влаги.',
          items: [],
        },
      ],
    },
    {
      slug: 'novinki',
      title: 'Новинки',
      layout: [
        {
          blockType: 'statement',
          text: '',
          paragraphs: 'То, что появилось в коллекции за последние три месяца. Натуральная итальянская кожа, новые силуэты и оттенки — успейте заметить первыми.',
        },
      ],
    },
    {
      slug: 'politika-konfidencialnosti',
      title: 'Политика конфиденциальности',
      layout: [
        {
          blockType: 'hero',
          title: 'Политика конфиденциальности',
          subtitle: 'Политика обработки персональных данных сайта Moranti. Редакция от 5 августа 2026 года.',
        },
        {
          blockType: 'section',
          number: '01',
          title: 'Общие положения',
          paragraphs: 'Настоящая политика описывает, какие данные обрабатываются при посещении сайта morantibags.ru и на каких основаниях это происходит. Политика разработана в соответствии с Федеральным законом № 152-ФЗ «О персональных данных».\n\nИспользуя сайт, вы принимаете условия этой политики. Данные обрабатываются в обезличенном виде и не позволяют идентифицировать посетителя; ограничить обработку можно в любой момент (см. раздел «Как ограничить обработку данных»).',
          items: [],
        },
        {
          blockType: 'section',
          number: '02',
          title: 'Оператор персональных данных',
          paragraphs: 'Сайт является каталогом-витриной: заказ, оплата, доставка и возврат осуществляются на маркетплейсах Wildberries и Ozon по их правилам. Персональные данные покупателей (имя, телефон, адрес доставки) обрабатывают маркетплейсы. Оператор их не собирает и не получает.',
          items: [],
        },
        {
          blockType: 'section',
          number: '03',
          title: 'Какие данные обрабатываются',
          paragraphs: '',
          items: [
            { text: 'Технические данные — IP-адрес, тип и версия браузера, операционная система, источник перехода, просмотренные страницы. Необходимы для корректной работы сайта.' },
            { text: 'Файлы cookie — технические (обеспечение работы сайта) и аналитические (измерение посещаемости).' },
            { text: 'Обезличенные данные Яндекс.Метрики — просмотры страниц, источники переходов. Запись действий посетителя (вебвизор, карта кликов) не ведётся.' },
            { text: 'Обезличенные данные Vercel Analytics — скорость загрузки страниц, ошибки, просмотры. Не позволяют идентифицировать пользователя.' },
            { text: 'Список избранного — хранится в localStorage вашего браузера и на сервер не передаётся.' },
          ],
        },
        {
          blockType: 'section',
          number: '04',
          title: 'Цели и правовые основания',
          paragraphs: 'Цели обработки: обеспечение работы сайта, анализ посещаемости и поведения посетителей, улучшение качества и удобства сайта, выявление технических ошибок.',
          items: [
            { text: 'Аналитические сервисы (Яндекс.Метрика, Vercel Analytics) обрабатывают только обезличенные данные посещаемости — запись действий посетителя не ведётся. Обработка осуществляется на основании законного интереса оператора (п. 5 ч. 1 ст. 6 152-ФЗ) и согласия не требует.' },
            { text: 'Технические данные обрабатываются как необходимые для функционирования сайта (ч. 1 ст. 6 152-ФЗ).' },
          ],
        },
        {
          blockType: 'section',
          number: '05',
          title: 'Cookie и аналитические сервисы',
          paragraphs: '',
          items: [
            { text: 'Яндекс.Метрика (ООО «Яндекс») — обезличенный счётчик посещаемости: просмотры страниц, источники переходов. Вебвизор и карта кликов отключены. Данные обрабатываются на серверах в Российской Федерации.' },
            { text: 'Vercel Analytics (Vercel Inc., США) — обезличенная статистика производительности. В связи с расположением серверов возможна трансграничная передача обезличенных данных, не позволяющих идентифицировать пользователя.' },
            { text: 'Состав и срок действия файлов cookie можно посмотреть и удалить в настройках браузера.' },
          ],
        },
        {
          blockType: 'section',
          number: '06',
          title: 'Сроки хранения данных',
          paragraphs: '',
          items: [
            { text: 'Технические данные — до достижения целей обработки, не дольше 30 дней.' },
            { text: 'Данные Яндекс.Метрики — в соответствии с условиями сервиса Яндекс.Метрики.' },
            { text: 'Cookie — до истечения срока действия файла cookie.' },
            { text: 'Обезличенные данные аналитики — до достижения целей обработки.' },
          ],
        },
        {
          blockType: 'section',
          number: '07',
          title: 'Права посетителя',
          paragraphs: 'В соответствии со ст. 14 Федерального закона № 152-ФЗ вы вправе:',
          items: [
            { text: 'получать информацию об обработке ваших данных;' },
            { text: 'требовать уточнения, блокирования или удаления данных;' },
            { text: 'требовать прекращения обработки данных;' },
            { text: 'обжаловать действия оператора в Роскомнадзоре или в суде.' },
          ],
        },
        {
          blockType: 'section',
          number: '08',
          title: 'Как ограничить обработку данных',
          paragraphs: '',
          items: [
            { text: 'Отключите cookie в настройках браузера — Яндекс.Метрика перестанет собирать данные посещаемости.' },
            { text: 'Используйте режим инкогнито или блокировку сторонних cookie.' },
            { text: 'Напишите нам через VK — рассмотрим обращение в течение 10 дней.' },
          ],
        },
        {
          blockType: 'section',
          number: '09',
          title: 'Изменения политики',
          paragraphs: 'Политика может обновляться при изменении законодательства или состава обрабатываемых данных. Актуальная редакция всегда публикуется на этой странице.',
          items: [],
        },
      ],
    },
  ]

  let pagesUpserted = 0
  for (const pg of defaultPages) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: any = { title: pg.title, slug: pg.slug, layout: pg.layout, status: 'published' }
    const existing = await payload.find({
      collection: 'pages',
      where: { slug: { equals: pg.slug } },
      limit: 1,
      overrideAccess: true,
    })
    if (existing.totalDocs > 0) {
      await payload.update({ collection: 'pages', id: existing.docs[0].id, data, overrideAccess: true })
    } else {
      await payload.create({ collection: 'pages', data, overrideAccess: true })
    }
    pagesUpserted++
  }

  // ---- SITE CONTENT GLOBAL (footer / contacts / social) — заполнено ----
  await payload.updateGlobal({
    slug: 'site-content',
    data: {
      footer: {
        aboutText: blocksToRichText([
          { text: 'Moranti — авторские кожаные сумки ручной работы. Натуральная кожа, честное ремесло, доставка по России.' },
        ]),
        copyright: '© 2026 Moranti. Все права защищены.',
      },
      contacts: {
        phone: '+7 (495) 123-45-67',
        email: 'info@moranti.ru',
        address: 'Москва, ул. Тверская, 15',
        city: 'Москва',
        workHours: 'Ежедневно 10:00–21:00',
      },
      social: [],
    },
    overrideAccess: true,
  })

  // ---- SITE STRINGS GLOBAL (любой текст на сайте) — заполнено дефолтами ----
  const defaultStrings = [
    { key: 'nav.catalog', label: 'Меню: Каталог', value: 'Каталог' },
    { key: 'nav.about', label: 'Меню: О нас', value: 'О нас' },
    { key: 'nav.delivery', label: 'Меню: Доставка', value: 'Доставка' },
    { key: 'nav.contacts', label: 'Меню: Контакты', value: 'Контакты' },
    { key: 'nav.guarantee', label: 'Меню: Гарантия', value: 'Гарантия' },
    { key: 'btn.cart', label: 'Кнопка: В корзину', value: 'В корзину' },
    { key: 'btn.buy', label: 'Кнопка: Купить', value: 'Купить' },
    { key: 'btn.more', label: 'Кнопка: Подробнее', value: 'Подробнее' },
    { key: 'btn.order', label: 'Кнопка: Оформить заказ', value: 'Оформить заказ' },
    { key: 'btn.view', label: 'Кнопка: Смотреть', value: 'Смотреть' },
    { key: 'btn.subscribe', label: 'Кнопка: Подписаться', value: 'Подписаться' },
    { key: 'section.related', label: 'Заголовок: Похожие товары', value: 'Похожие товары' },
    { key: 'section.features', label: 'Заголовок: Характеристики', value: 'Характеристики' },
    { key: 'section.description', label: 'Заголовок: Описание', value: 'Описание' },
    { key: 'section.reviews', label: 'Заголовок: Отзывы', value: 'Отзывы' },
    { key: 'section.delivery', label: 'Заголовок: Доставка и оплата', value: 'Доставка и оплата' },
    { key: 'label.price', label: 'Подпись: Цена', value: 'Цена' },
    { key: 'label.color', label: 'Подпись: Цвет', value: 'Цвет' },
    { key: 'label.size', label: 'Подпись: Размер', value: 'Размер' },
    { key: 'label.inStock', label: 'Подпись: В наличии', value: 'В наличии' },
    { key: 'label.outOfStock', label: 'Подпись: Нет в наличии', value: 'Нет в наличии' },
    { key: 'label.material', label: 'Подпись: Материал', value: 'Материал' },
    { key: 'label.quantity', label: 'Подпись: Количество', value: 'Количество' },
    { key: 'label.brand', label: 'Подпись: Бренд', value: 'Бренд' },
    { key: 'home.featuredTitle', label: 'Главная: Популярные', value: 'Популярные модели' },
    { key: 'home.categoriesTitle', label: 'Главная: Категории', value: 'Категории' },
    { key: 'home.aboutTitle', label: 'Главная: О бренде', value: 'О бренде Moranti' },
    { key: 'footer.privacy', label: 'Футер: Политика', value: 'Политика конфиденциальности' },
    { key: 'common.search', label: 'Общее: Поиск', value: 'Поиск' },
    { key: 'common.favorites', label: 'Общее: Избранное', value: 'Избранное' },
    { key: 'common.backToCatalog', label: 'Общее: Вернуться в каталог', value: 'Вернуться в каталог' },
    { key: 'nav.home', label: 'Меню: Главная', value: 'Главная' },
    { key: 'nav.new', label: 'Меню: Новинки', value: 'Новинки' },
    { key: 'marketplace.wb', label: 'Магазин: Wildberries', value: 'Wildberries' },
    { key: 'marketplace.ozon', label: 'Магазин: Ozon', value: 'Ozon' },
    { key: 'section.new', label: 'Заголовок: Новинки', value: 'Новинки' },
    { key: 'cta.catalog', label: 'Кнопка: Открыть каталог', value: 'Открыть каталог' },
    { key: 'btn.viewAll', label: 'Кнопка: Смотреть все', value: 'Смотреть все' },
    { key: 'btn.viewMore', label: 'Кнопка: Смотреть ещё', value: 'Смотреть ещё' },
  ]
  await payload.updateGlobal({
    slug: 'site-strings',
    data: { strings: defaultStrings },
    overrideAccess: true,
  })

  return NextResponse.json({
    ok: true,
    categories: catSlugs.length,
    modelsUpserted: legacyModels.length,
    productsUpserted,
    testDirectCreated: testCreated,
    pagesUpserted,
    settings: settingsStatus,
  })
}
