import type { CollectionConfig } from 'payload'

export const Categories: CollectionConfig = {
  slug: 'categories',
  access: { read: () => true },
  labels: { singular: 'Категория', plural: 'Категории' },
  admin: { useAsTitle: 'name', defaultColumns: ['name', 'slug', 'updatedAt'], group: 'Магазин', description: 'Категории каталога (кросс-боди, тоут, багет, седло, рюкзак и т.п.).' },
  fields: [
    { name: 'name', type: 'text', label: 'Название', required: true },
    { name: 'slug', type: 'text', label: 'ЧПУ', required: true, unique: true },
    { name: 'description', type: 'textarea', label: 'Описание' },
    { name: 'image', type: 'text', label: 'Изображение', admin: { components: { Field: { path: '@/components/admin/MediaPicker#MediaPicker' } } } },
    {
      name: 'parent',
      type: 'relationship',
      label: 'Родительская категория',
      relationTo: 'categories',
    },
  ],
}
