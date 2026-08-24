import type { CollectionConfig } from 'payload'

export const Customers: CollectionConfig = {
  slug: 'customers',
  labels: { singular: 'Покупатель', plural: 'Покупатели' },
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'firstName', 'lastName', 'phone', 'createdAt'],
    defaultSort: '-createdAt',
    group: 'Магазин',
    description: 'Клиенты, зарегистрированные на сайте (не путать с «Сотрудники»).',
  },
  auth: true,
  access: {
    create: () => true,
    read: ({ req: { user } }) => {
      if (!user) return false
      if (user.collection === 'users') return true
      return { id: { equals: user.id } }
    },
    update: ({ req: { user } }) => {
      if (!user) return false
      if (user.collection === 'users') return true
      return { id: { equals: user.id } }
    },
    delete: ({ req: { user } }) => user?.collection === 'users',
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Основное',
          fields: [
            { name: 'firstName', type: 'text', label: 'Имя' },
            { name: 'lastName', type: 'text', label: 'Фамилия' },
            { name: 'phone', type: 'text', label: 'Телефон' },
          ],
        },
        {
          label: 'Адреса',
          fields: [
            {
              name: 'addresses',
              type: 'array',
              label: 'Адреса доставки',
              fields: [
                { name: 'line', type: 'text', label: 'Адрес' },
                { name: 'city', type: 'text', label: 'Город' },
                { name: 'zip', type: 'text', label: 'Индекс' },
              ],
            },
          ],
        },
        {
          label: 'Заметки',
          fields: [
            { name: 'notes', type: 'textarea', label: 'Заметки менеджера' },
          ],
        },
        {
          label: 'Служебное',
          fields: [
            {
              name: 'magicToken',
              type: 'text',
              label: 'Токен входа по ссылке',
              admin: { hidden: true },
            },
            {
              name: 'magicTokenExpiry',
              type: 'date',
              label: 'Срок токена',
              admin: { hidden: true },
            },
          ],
        },
      ],
    },
  ],
}
