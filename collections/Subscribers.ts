import type { CollectionConfig } from 'payload'

export const Subscribers: CollectionConfig = {
  slug: 'subscribers',
  labels: { singular: 'Подписчик', plural: 'Подписчики' },
  admin: { useAsTitle: 'email', defaultColumns: ['email', 'name', 'status', 'createdAt'], group: 'Рассылка', description: 'Подписчики рассылки (email-маркетинг).' },
  fields: [
    { name: 'email', type: 'email', label: 'Email', required: true, unique: true },
    { name: 'name', type: 'text', label: 'Имя' },
    {
      name: 'status',
      type: 'select',
      label: 'Статус',
      defaultValue: 'active',
      options: [
        { value: 'active', label: 'Активен' },
        { value: 'unsubscribed', label: 'Отписан' },
      ],
    },
    { name: 'source', type: 'text', label: 'Источник' },
    {
      name: 'tags',
      type: 'array',
      label: 'Теги',
      fields: [{ name: 'tag', type: 'text', label: 'Тег' }],
    },
  ],
}
