import type { CollectionConfig } from 'payload'

export const Subscribers: CollectionConfig = {
  slug: 'subscribers',
  admin: {
    useAsTitle: 'email',
  },
  fields: [
    {
      name: 'email',
      type: 'text',
      required: true,
      unique: true,
    },
    {
      name: 'confirmed',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'consentedAt',
      type: 'date',
      required: true,
    },
    {
      name: 'source',
      type: 'text',
      defaultValue: 'footer',
    },
    {
      name: 'confirmToken',
      type: 'text',
      unique: true,
    },
    {
      name: 'unsubscribeToken',
      type: 'text',
      unique: true,
    },
    {
      name: 'confirmedAt',
      type: 'date',
    },
    {
      name: 'unsubscribedAt',
      type: 'date',
    },
  ],
}
