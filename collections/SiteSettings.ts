import type { CollectionConfig } from 'payload'

export const SiteSettings: CollectionConfig = {
  slug: 'site-settings',
  admin: {
    useAsTitle: 'id',
  },
  fields: [
    {
      name: 'data',
      type: 'json',
      required: true,
    },
  ],
}
