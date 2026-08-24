import type { CollectionConfig, Field } from 'payload'

/* =============================================
   Moranti — Страницы (блочный редактор)
   Контент страницы = массив блоков layout.
   Блоки можно добавлять, переставлять,
   у каждого — понятные поля.
   ============================================= */

// Общие поля картинки: либо загрузка в «Медиа», либо готовый путь/URL
const imageFields: Field[] = [
  { name: 'image', type: 'upload', relationTo: 'media', label: 'Файл из Медиатеки' },
  {
    name: 'imageUrl',
    type: 'text',
    label: '…или путь / URL картинки',
    admin: { description: 'Например: /about/bag-4.jpg или https://…' },
  },
]

export const Pages: CollectionConfig = {
  slug: 'pages',
  access: { read: () => true },
  labels: { singular: 'Страница', plural: 'Страницы' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'status', 'updatedAt'],
    group: 'Контент',
    description: 'Контент страниц сайта: Главная, О бренде, Уход, Доставка, Контакты, Политика. Редактируется блоками.',
  },
  fields: [
    { name: 'title', type: 'text', label: 'Заголовок страницы (H1 и меню)', required: true },
    { name: 'slug', type: 'text', label: 'ЧПУ', required: true, unique: true },

    /* ---------------- БЛОКИ СТРАНИЦЫ ---------------- */
    {
      name: 'layout',
      type: 'blocks',
      label: 'Блоки страницы',
      blocks: [
        /* ——— Хиро: надзаголовок, заголовок, лид, фото ——— */
        {
          slug: 'hero',
          labels: { singular: 'Хиро (шапка страницы)', plural: 'Хиро' },
          fields: [
            { name: 'eyebrow', type: 'text', label: 'Надзаголовок (мелко сверху)' },
            { name: 'title', type: 'text', label: 'Заголовок' },
            { name: 'subtitle', type: 'textarea', label: 'Подзаголовок / лид' },
            ...imageFields,
            { name: 'imageCaption', type: 'text', label: 'Подпись под фото' },
          ],
        },

        /* ——— Раздел: номер + заголовок + абзацы + список + фото ——— */
        {
          slug: 'section',
          labels: { singular: 'Раздел (01, 02…)', plural: 'Разделы' },
          fields: [
            { name: 'number', type: 'text', label: 'Номер секции', admin: { placeholder: '01' } },
            { name: 'title', type: 'text', label: 'Заголовок раздела' },
            {
              name: 'paragraphs',
              type: 'textarea',
              label: 'Текст (абзацы разделяйте пустой строкой)',
            },
            {
              name: 'items',
              type: 'array',
              label: 'Список пунктов (необязательно)',
              labels: { singular: 'Пункт', plural: 'Пункты' },
              fields: [{ name: 'text', type: 'textarea', label: 'Пункт списка' }],
            },
            ...imageFields,
          ],
        },

        /* ——— Крупный тезис: большая цитата/манифест ——— */
        {
          slug: 'statement',
          labels: { singular: 'Крупный тезис', plural: 'Крупные тезисы' },
          fields: [
            { name: 'text', type: 'textarea', label: 'Тезис (крупным шрифтом)' },
            { name: 'paragraphs', type: 'textarea', label: 'Пояснение (абзацы через пустую строку)' },
            ...imageFields,
          ],
        },

        /* ——— Галерея: одна или несколько картинок ——— */
        {
          slug: 'images',
          labels: { singular: 'Картинка / галерея', plural: 'Картинки' },
          fields: [
            {
              name: 'images',
              type: 'array',
              label: 'Картинки',
              labels: { singular: 'Картинка', plural: 'Картинки' },
              minRows: 1,
              fields: [
                ...imageFields,
                { name: 'caption', type: 'text', label: 'Подпись' },
              ],
            },
          ],
        },

        /* ——— Карточки-ссылки («Moranti в жизни») ——— */
        {
          slug: 'cards',
          labels: { singular: 'Карточки-ссылки', plural: 'Карточки' },
          fields: [
            { name: 'title', type: 'text', label: 'Заголовок блока' },
            {
              name: 'cards',
              type: 'array',
              label: 'Карточки',
              minRows: 1,
              fields: [
                { name: 'name', type: 'text', label: 'Название' },
                { name: 'subtitle', type: 'text', label: 'Подстрока (например «Тоут · шопер»)' },
                { name: 'text', type: 'textarea', label: 'Описание' },
                { name: 'href', type: 'text', label: 'Ссылка' },
              ],
            },
            { name: 'outro', type: 'textarea', label: 'Текст после карточек' },
          ],
        },

        /* ——— Призыв к действию ——— */
        {
          slug: 'cta',
          labels: { singular: 'Призыв к действию (CTA)', plural: 'CTA' },
          fields: [
            { name: 'title', type: 'text', label: 'Заголовок' },
            { name: 'text', type: 'textarea', label: 'Описание' },
            {
              name: 'buttons',
              type: 'array',
              label: 'Кнопки',
              minRows: 1,
              fields: [
                { name: 'label', type: 'text', label: 'Надпись на кнопке' },
                { name: 'href', type: 'text', label: 'Ссылка' },
                {
                  name: 'style',
                  type: 'select',
                  label: 'Стиль кнопки',
                  defaultValue: 'primary',
                  options: [
                    { value: 'primary', label: 'Основная' },
                    { value: 'secondary', label: 'Вторичная (ссылка)' },
                  ],
                },
              ],
            },
          ],
         },
          /* ——— Герой главной (полноэкранный, с фото) ——— */
          {
            slug: 'homeHero',
            labels: { singular: 'Герой главной', plural: 'Герой главной' },
            fields: [
              { name: 'eyebrow', type: 'text', label: 'Надзаголовок (мелко сверху)' },
              { name: 'title', type: 'text', label: 'Заголовок' },
              { name: 'tagline', type: 'textarea', label: 'Лид (под заголовком)' },
              { name: 'subtitle', type: 'text', label: 'Подзаголовок (мелко)' },
              { name: 'buttonLabel', type: 'text', label: 'Надпись на кнопке', defaultValue: 'Смотреть коллекцию' },
              { name: 'buttonHref', type: 'text', label: 'Ссылка кнопки', defaultValue: '/catalog' },
              ...imageFields,
              { name: 'imageMobile', type: 'upload', relationTo: 'media', label: 'Файл из Медиатеки (мобильная версия, опц.)' },
              { name: 'imageMobileUrl', type: 'text', label: '…или путь / URL мобильной версии' },
              { name: 'caption', type: 'text', label: 'Подпись под фото' },
            ],
          },
          /* ——— Товары (новинки / популярные / ручной выбор) ——— */
          {
            slug: 'products',
            labels: { singular: 'Товары', plural: 'Товары' },
            fields: [
              { name: 'title', type: 'text', label: 'Заголовок секции' },
              { name: 'subtitle', type: 'textarea', label: 'Подзаголовок секции' },
              {
                name: 'source',
                type: 'select',
                label: 'Откуда брать товары',
                defaultValue: 'popular',
                options: [
                  { value: 'new', label: 'Новинки (за 90 дней)' },
                  { value: 'popular', label: 'Популярные (по отзывам и рейтингу)' },
                  { value: 'manual', label: 'Ручной выбор' },
                ],
              },
              {
                name: 'manualProducts',
                type: 'relationship',
                label: 'Товары (для «Ручной выбор»)',
                relationTo: 'products',
                hasMany: true,
                admin: { condition: (data: any) => data?.source === 'manual' },
              },
              { name: 'limit', type: 'number', label: 'Сколько показывать', defaultValue: 8 },
            ],
          },
          /* ——— Категории (карточки коллекций) ——— */
          {
            slug: 'categories',
            labels: { singular: 'Категории', plural: 'Категории' },
            fields: [
              { name: 'title', type: 'text', label: 'Заголовок секции' },
              { name: 'subtitle', type: 'textarea', label: 'Подзаголовок секции' },
            ],
          },
       ],
     },

    { name: 'featuredImage', type: 'text', label: 'Картинка (URL)', hidden: true },
    {
      name: 'status',
      type: 'select',
      label: 'Статус',
      defaultValue: 'published',
      options: [
        { value: 'published', label: 'Опубликовано' },
        { value: 'draft', label: 'Черновик' },
      ],
    },
    {
      name: 'seo',
      type: 'group',
      label: 'SEO',
      fields: [
        { name: 'title', type: 'text', label: 'Заголовок' },
        { name: 'description', type: 'textarea', label: 'Описание' },
      ],
    },
  ],
}
