import type { GlobalConfig } from 'payload'

/**
 * «Контент сайта» — глобальные блоки, которые повторяются на всех страницах
 * (подвал, контакты, соцсети). Основной контент (hero главной, тексты страниц,
 * блог) редактируется в коллекции «Страницы» (как в WordPress), а не здесь.
 */
export const SiteContent: GlobalConfig = {
  slug: 'site-content',
  label: 'Контент сайта',
  admin: {
    group: 'Настройки',
    description: 'Что повторяется на всех страницах: подвал (описание бренда, копирайт), контакты, соцсети.',
  },
  access: { read: () => true },
  fields: [
    {
      name: 'footer',
      type: 'group',
      label: 'Подвал сайта',
      fields: [
        { name: 'aboutText', type: 'richText', label: 'Описание бренда в подвале' },
        { name: 'copyright', type: 'text', label: 'Копирайт' },
      ],
    },
    {
      name: 'contacts',
      type: 'group',
      label: 'Контакты',
      fields: [
        { name: 'phone', type: 'text', label: 'Телефон' },
        { name: 'email', type: 'text', label: 'Email' },
        { name: 'address', type: 'text', label: 'Адрес' },
        { name: 'city', type: 'text', label: 'Город' },
        { name: 'workHours', type: 'text', label: 'Часы работы' },
      ],
    },
    {
      name: 'social',
      type: 'array',
      label: 'Соцсети',
      fields: [
        {
          name: 'platform',
          type: 'select',
          label: 'Платформа',
          options: [
            { value: 'vk', label: 'VK' },
            { value: 'telegram', label: 'Telegram' },
            { value: 'whatsapp', label: 'WhatsApp' },
          ],
        },
        { name: 'url', type: 'text', label: 'Ссылка' },
      ],
    },
  ],
}
