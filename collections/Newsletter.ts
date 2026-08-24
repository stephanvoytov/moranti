import type { GlobalConfig } from 'payload'

export const Newsletter: GlobalConfig = {
  slug: 'newsletter',
  label: 'Рассылка',
  admin: {
    group: 'Рассылка',
    description: 'Отправка писем активным подписчикам. Тема и текст сохраняются — отправка кнопкой ниже.',
  },
  access: {
    read: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
  },
  fields: [
    { name: 'subject', type: 'text', label: 'Тема письма', required: true },
    {
      name: 'message',
      type: 'richText',
      label: 'Текст письма',
      required: true,
    },
    {
      name: 'send',
      type: 'ui',
      label: 'Отправка',
      admin: {
        components: {
          Field: { path: '@/components/admin/NewsletterSend#NewsletterSend' },
        },
      },
    },
  ],
}
