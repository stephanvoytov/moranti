import type { GlobalConfig } from 'payload'

/**
 * «Тексты сайта» — единое место, где редактируется ЛЮБОЙ текст на сайте
 * (как менеджер строк в WordPress): навигация, кнопки, заголовки секций,
 * подписи полей, футер и т.д. Storefront берёт строки по `key`.
 *
 * Добавляйте новые строки прямо из админки — массив не ограничен.
 */
export const SiteStrings: GlobalConfig = {
  slug: 'site-strings',
  label: 'Тексты сайта',
  access: { read: () => true },
  fields: [
    {
      name: 'strings',
      type: 'array',
      label: 'Тексты (любой текст на сайте)',
      admin: { description: 'Каждая строка: ключ (системный, не менять), назначение (для себя), текст.' },
      fields: [
        { name: 'key', type: 'text', label: 'Ключ (системный)' },
        { name: 'label', type: 'text', label: 'Назначение (для вас)' },
        { name: 'value', type: 'text', label: 'Текст' },
      ],
    },
  ],
}
