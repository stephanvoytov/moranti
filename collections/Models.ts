import type { CollectionConfig } from 'payload'

export const Models: CollectionConfig = {
  slug: 'models',
  admin: {
    useAsTitle: 'name',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
    },
    {
      name: 'slug',
      type: 'text',
      unique: true,
    },
    {
      name: 'category',
      type: 'text',
    },
    {
      name: 'composition',
      type: 'text',
    },
    {
      name: 'description',
      type: 'text',
    },
    {
      name: 'image',
      type: 'text',
    },
    {
      name: 'imtId',
      type: 'number',
      unique: true,
    },
    {
      name: 'variants',
      type: 'relationship',
      relationTo: 'products',
      hasMany: true,
    },
  ],
}
