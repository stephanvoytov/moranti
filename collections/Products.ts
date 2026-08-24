import type { CollectionConfig } from 'payload'

export const Products: CollectionConfig = {
  slug: 'products',
  access: { read: () => true },
  labels: { singular: 'Товар', plural: 'Товары' },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'sku', 'category', 'isDirectSale', 'price', 'inStock', 'updatedAt'],
    preview: ({ data }) => {
      const slug = (data as { slug?: string } | undefined)?.slug
      return slug ? `/catalog/${slug}` : null
    },
    group: 'Магазин',
    description: 'Товары магазина — сумки из каталога (фото, цены, наличие, маркетплейсы).',
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Основное',
          fields: [
            { name: 'name', type: 'text', label: 'Название', required: true },
            { name: 'slug', type: 'text', label: 'ЧПУ', required: true, unique: true },
            { name: 'sku', type: 'text', label: 'Артикул' },
            { name: 'category', type: 'relationship', label: 'Категория', relationTo: 'categories' },
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
            { name: 'featured', type: 'checkbox', label: 'Рекомендуемый' },
          ],
        },
        {
          label: 'Продажа',
          fields: [
            { name: 'isDirectSale', type: 'checkbox', label: 'Прямая продажа (свой магазин)' },
            { name: 'directPrice', type: 'number', label: 'Цена прямой продажи (₽)' },
            { name: 'price', type: 'number', label: 'Цена (₽)' },
            { name: 'originalPrice', type: 'number', label: 'Старая цена (₽)' },
            { name: 'currency', type: 'text', label: 'Валюта', defaultValue: '₽' },
          ],
        },
        {
          label: 'Наличие',
          fields: [
            { name: 'inStock', type: 'checkbox', label: 'В наличии', defaultValue: true },
            { name: 'stockQuantity', type: 'number', label: 'Остаток на складе' },
            { name: 'wbStock', type: 'number', label: 'Остаток Wildberries' },
            { name: 'ozonStock', type: 'number', label: 'Остаток Ozon' },
          ],
        },
        {
          label: 'Описание',
          fields: [
            { name: 'shortDescription', type: 'textarea', label: 'Краткое описание' },
            { name: 'description', type: 'richText', label: 'Полное описание' },
          ],
        },
        {
          label: 'Медиа',
          fields: [
            {
              name: 'image',
              type: 'text',
              label: 'Основное фото',
              admin: {
                components: {
                  Field: { path: '@/components/admin/MediaPicker#MediaPicker' },
                },
              },
            },
            {
              name: 'gallery',
              type: 'array',
              label: 'Галерея',
              fields: [
                { name: 'image', type: 'text', label: 'URL', admin: { components: { Field: { path: '@/components/admin/MediaPicker#MediaPicker' } } } },
                { name: 'alt', type: 'text', label: 'Alt' },
              ],
            },
            { name: 'video', type: 'text', label: 'Видео (URL)' },
          ],
        },
        {
          label: 'Атрибуты',
          fields: [
            {
              name: 'characteristics',
              type: 'array',
              label: 'Характеристики',
              fields: [
                { name: 'key', type: 'text', label: 'Название' },
                { name: 'value', type: 'text', label: 'Значение' },
              ],
            },
          ],
        },
        {
          label: 'Маркетплейсы',
          fields: [
            { name: 'wbArticle', type: 'number', label: 'Артикул Wildberries' },
            { name: 'ozonArticle', type: 'number', label: 'Артикул Ozon' },
            { name: 'wbPrice', type: 'number', label: 'Цена Wildberries' },
            { name: 'ozonPrice', type: 'number', label: 'Цена Ozon' },
            { name: 'wbOriginalPrice', type: 'number', label: 'Старая цена Wildberries' },
            { name: 'ozonOriginalPrice', type: 'number', label: 'Старая цена Ozon' },
          ],
        },
        {
          label: 'Связи',
          fields: [
            { name: 'model', type: 'relationship', label: 'Модель (вариация)', relationTo: 'models' },
            { name: 'colorName', type: 'text', label: 'Цвет' },
            { name: 'composition', type: 'text', label: 'Состав' },
            { name: 'rating', type: 'number', label: 'Рейтинг' },
            { name: 'reviewsCount', type: 'number', label: 'Отзывы' },
            { name: 'salesCount', type: 'number', label: 'Продажи' },
            { name: 'wbCreatedAt', type: 'date', label: 'Создано на WB (для новинок)' },
          ],
        },
        {
          label: 'Превью',
          fields: [
            {
              name: 'preview',
              type: 'ui',
              admin: {
                components: {
                  Field: { path: '@/components/admin/ProductPreview#ProductPreview' },
                },
              },
            },
          ],
        },
      ],
    },
  ],
}
