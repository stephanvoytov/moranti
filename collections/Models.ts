import type { CollectionConfig } from 'payload'

export const Models: CollectionConfig = {
  slug: 'models',
  access: { read: () => true },
  labels: { singular: 'Модель', plural: 'Модели' },
  admin: { useAsTitle: 'name', defaultColumns: ['name', 'category', 'imtId', 'updatedAt'] },
  fields: [
    { name: 'name', type: 'text', label: 'Название', required: true },
    { name: 'slug', type: 'text', label: 'ЧПУ', required: true, unique: true },
    { name: 'category', type: 'relationship', label: 'Категория', relationTo: 'categories' },
    { name: 'imtId', type: 'number', label: 'WB imtId' },
    { name: 'description', type: 'textarea', label: 'Описание' },
    { name: 'composition', type: 'text', label: 'Состав' },
    { name: 'image', type: 'text', label: 'Фото (URL)' },
    {
      name: 'gallery',
      type: 'array',
      label: 'Галерея',
      fields: [
        { name: 'image', type: 'text', label: 'URL' },
        { name: 'alt', type: 'text', label: 'Alt' },
      ],
    },
  ],
}
