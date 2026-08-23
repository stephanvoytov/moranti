import type { CollectionConfig } from 'payload'

export const Posts: CollectionConfig = {
  slug: 'posts',
  access: { read: () => true },
  labels: { singular: 'Статья', plural: 'Статьи' },
  admin: { useAsTitle: 'title', defaultColumns: ['title', 'slug', 'status', 'publishedAt'] },
  fields: [
    { name: 'title', type: 'text', label: 'Заголовок', required: true },
    { name: 'slug', type: 'text', label: 'ЧПУ', required: true, unique: true },
    { name: 'excerpt', type: 'textarea', label: 'Анонс' },
    { name: 'content', type: 'richText', label: 'Текст' },
    { name: 'featuredImage', type: 'text', label: 'Картинка (URL)' },
    { name: 'publishedAt', type: 'date', label: 'Дата публикации' },
    {
      name: 'status',
      type: 'select',
      label: 'Статус',
      defaultValue: 'draft',
      options: [
        { value: 'published', label: 'Опубликовано' },
        { value: 'draft', label: 'Черновик' },
      ],
    },
  ],
}
