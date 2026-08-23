import type { CollectionConfig } from 'payload'

export const SiteSettings: CollectionConfig = {
  slug: 'site-settings',
  labels: { singular: 'Настройки', plural: 'Настройки' },
  admin: { useAsTitle: 'storeName' },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Магазин',
          fields: [
            { name: 'storeName', type: 'text', label: 'Название магазина' },
            { name: 'contactEmail', type: 'email', label: 'Контактный email' },
            { name: 'currency', type: 'text', label: 'Валюта', defaultValue: '₽' },
          ],
        },
        {
          label: 'Маркетплейсы',
          fields: [
            { name: 'wbApiKey', type: 'text', label: 'Wildberries API ключ' },
            { name: 'ozonClientId', type: 'text', label: 'Ozon Client ID' },
            { name: 'ozonApiKey', type: 'text', label: 'Ozon API ключ' },
          ],
        },
        {
          label: 'Email (SMTP)',
          fields: [
            { name: 'smtpHost', type: 'text', label: 'SMTP хост' },
            { name: 'smtpPort', type: 'number', label: 'SMTP порт' },
            { name: 'smtpUser', type: 'text', label: 'SMTP пользователь' },
            { name: 'smtpPass', type: 'text', label: 'SMTP пароль' },
            { name: 'smtpFrom', type: 'email', label: 'Email отправителя' },
          ],
        },
      ],
    },
  ],
}
