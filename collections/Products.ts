import type { CollectionConfig } from 'payload'

export const Products: CollectionConfig = {
  slug: 'products',
  admin: {
    useAsTitle: 'name',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      unique: true,
    },
    {
      name: 'sku',
      type: 'text',
      unique: true,
    },
    {
      name: 'price',
      type: 'number',
    },
    {
      name: 'originalPrice',
      type: 'number',
    },
    {
      name: 'currency',
      type: 'text',
      defaultValue: '₽',
    },
    {
      name: 'category',
      type: 'text',
    },
    {
      name: 'description',
      type: 'textarea',
    },
    {
      name: 'image',
      type: 'text',
    },
    {
      name: 'images',
      type: 'array',
      fields: [
        {
          name: 'url',
          type: 'text',
        },
      ],
    },
    {
      name: 'wbArticle',
      type: 'number',
      unique: true,
    },
    {
      name: 'ozonArticle',
      type: 'number',
      unique: true,
    },
    {
      name: 'wbPrice',
      type: 'number',
    },
    {
      name: 'ozonPrice',
      type: 'number',
    },
    {
      name: 'colorName',
      type: 'text',
    },
    {
      name: 'composition',
      type: 'text',
    },
    {
      name: 'inStock',
      type: 'checkbox',
      defaultValue: true,
    },
    {
      name: 'rating',
      type: 'number',
    },
    {
      name: 'model',
      type: 'relationship',
      relationTo: 'models',
    },
  ],
}
