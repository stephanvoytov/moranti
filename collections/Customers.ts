import type { CollectionConfig } from 'payload'

export const Customers: CollectionConfig = {
  slug: 'customers',
  labels: { singular: 'Покупатель', plural: 'Покупатели' },
  admin: { useAsTitle: 'email', defaultColumns: ['email', 'firstName', 'phone', 'createdAt'] },
  auth: true,
  fields: [
    { name: 'firstName', type: 'text', label: 'Имя' },
    { name: 'lastName', type: 'text', label: 'Фамилия' },
    { name: 'phone', type: 'text', label: 'Телефон' },
    {
      name: 'addresses',
      type: 'array',
      label: 'Адреса',
      fields: [
        { name: 'line', type: 'text', label: 'Адрес' },
        { name: 'city', type: 'text', label: 'Город' },
        { name: 'zip', type: 'text', label: 'Индекс' },
      ],
    },
    { name: 'notes', type: 'textarea', label: 'Заметки менеджера' },
  ],
}
