import type { CollectionConfig } from 'payload'

export const Categories: CollectionConfig = {
  slug: 'categories',
  access: { read: () => true },
  labels: { singular: 'Категория', plural: 'Категории' },
  admin: { useAsTitle: 'name', defaultColumns: ['name', 'slug', 'updatedAt'] },
  fields: [
    { name: 'name', type: 'text', label: 'Название', required: true },
    { name: 'slug', type: 'text', label: 'ЧПУ', required: true, unique: true },
    { name: 'description', type: 'textarea', label: 'Описание' },
    { name: 'image', type: 'text', label: 'Изображение (URL)' },
    {
      name: 'parent',
      type: 'relationship',
      label: 'Родительская категория',
      relationTo: 'categories',
    },
  ],
}
