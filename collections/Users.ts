import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  auth: true,
  labels: { singular: 'Сотрудник', plural: 'Сотрудники' },
  admin: {
    useAsTitle: 'email',
    group: 'Доступ',
    description: 'Сотрудники с доступом в админку (роли: admin / editor / user).',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'roles',
      type: 'select',
      hasMany: true,
      options: ['admin', 'editor', 'user'],
      required: true,
      defaultValue: ['admin'],
      saveToJWT: true,
    },
  ],
}
