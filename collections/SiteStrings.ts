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
  admin: {
    group: 'Настройки',
    description: 'Все повторяющиеся надписи интерфейса: меню, кнопки, заголовки, подписи, футер. Тексты главной страницы редактируются в разделе «Страницы → Главная». Меняется сразу на сайте.',
  },
  access: { read: () => true },
  fields: [
    {
      name: 'strings',
      type: 'array',
      label: 'Тексты (любой текст на сайте)',
      admin: {
        description: 'Каждая строка: группа, ключ (системный, не менять), назначение (для себя), текст. Строки свёрнуты по группам.',
      },
      fields: [
        {
          name: 'group',
          type: 'select',
          label: 'Группа',
          defaultValue: 'common',
          options: [
            { value: 'nav', label: 'Навигация' },
            { value: 'btn', label: 'Кнопки' },
            { value: 'title', label: 'Заголовки' },
            { value: 'label', label: 'Подписи' },
            { value: 'footer', label: 'Футер' },
            { value: 'common', label: 'Общее' },
            { value: 'marketplace', label: 'Маркетплейсы' },
          ],
        },
        { name: 'key', type: 'text', label: 'Ключ (системный)' },
        { name: 'label', type: 'text', label: 'Назначение (для вас)' },
        { name: 'value', type: 'text', label: 'Текст' },
      ],
    },
  ],
}
