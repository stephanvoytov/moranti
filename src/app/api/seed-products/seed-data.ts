import { blocksToRichText } from '@/lib/richtext'

/* =============================================
   Moranti — Seed data shared by the seed route
   and the content-reseed route. Source of truth
   for site-strings and site-content globals.
   ============================================= */

export const defaultStrings = [
  { key: 'nav.catalog', label: 'Меню: Каталог', value: 'Каталог' },
  { key: 'nav.about', label: 'Меню: О нас', value: 'О нас' },
  { key: 'nav.delivery', label: 'Меню: Доставка', value: 'Доставка' },
  { key: 'nav.contacts', label: 'Меню: Контакты', value: 'Контакты' },
  { key: 'nav.guarantee', label: 'Меню: Гарантия', value: 'Гарантия' },
  { key: 'btn.cart', label: 'Кнопка: В корзину', value: 'В корзину' },
  { key: 'btn.buy', label: 'Кнопка: Купить', value: 'Купить' },
  { key: 'btn.more', label: 'Кнопка: Подробнее', value: 'Подробнее' },
  { key: 'btn.order', label: 'Кнопка: Оформить заказ', value: 'Оформить заказ' },
  { key: 'btn.view', label: 'Кнопка: Смотреть', value: 'Смотреть' },
  { key: 'btn.subscribe', label: 'Кнопка: Подписаться', value: 'Подписаться' },
  { key: 'section.related', label: 'Заголовок: Похожие товары', value: 'Похожие товары' },
  { key: 'section.features', label: 'Заголовок: Характеристики', value: 'Характеристики' },
  { key: 'section.description', label: 'Заголовок: Описание', value: 'Описание' },
  { key: 'section.reviews', label: 'Заголовок: Отзывы', value: 'Отзывы' },
  { key: 'section.delivery', label: 'Заголовок: Доставка и оплата', value: 'Доставка и оплата' },
  { key: 'label.price', label: 'Подпись: Цена', value: 'Цена' },
  { key: 'label.color', label: 'Подпись: Цвет', value: 'Цвет' },
  { key: 'label.size', label: 'Подпись: Размер', value: 'Размер' },
  { key: 'label.inStock', label: 'Подпись: В наличии', value: 'В наличии' },
  { key: 'label.outOfStock', label: 'Подпись: Нет в наличии', value: 'Нет в наличии' },
  { key: 'label.material', label: 'Подпись: Материал', value: 'Материал' },
  { key: 'label.quantity', label: 'Подпись: Количество', value: 'Количество' },
  { key: 'label.brand', label: 'Подпись: Бренд', value: 'Бренд' },
  { key: 'home.featuredTitle', label: 'Главная: Популярные', value: 'Популярные модели' },
  { key: 'home.categoriesTitle', label: 'Главная: Категории', value: 'Категории' },
  { key: 'home.aboutTitle', label: 'Главная: О бренде', value: 'О бренде Moranti' },
  { key: 'footer.privacy', label: 'Футер: Политика', value: 'Политика конфиденциальности' },
  { key: 'common.search', label: 'Общее: Поиск', value: 'Поиск' },
  { key: 'common.favorites', label: 'Общее: Избранное', value: 'Избранное' },
  { key: 'common.backToCatalog', label: 'Общее: Вернуться в каталог', value: 'Вернуться в каталог' },
  { key: 'nav.home', label: 'Меню: Главная', value: 'Главная' },
  { key: 'nav.new', label: 'Меню: Новинки', value: 'Новинки' },
  { key: 'marketplace.wb', label: 'Магазин: Wildberries', value: 'Wildberries' },
  { key: 'marketplace.ozon', label: 'Магазин: Ozon', value: 'Ozon' },
  { key: 'section.new', label: 'Заголовок: Новинки', value: 'Новинки' },
  { key: 'cta.catalog', label: 'Кнопка: Открыть каталог', value: 'Открыть каталог' },
  { key: 'btn.viewAll', label: 'Кнопка: Смотреть все', value: 'Смотреть все' },
  { key: 'btn.viewMore', label: 'Кнопка: Смотреть ещё', value: 'Смотреть ещё' },
  { key: 'hero.title', label: 'Хиро на главной: заголовок', value: 'Moranti' },
  { key: 'hero.tagline', label: 'Хиро: слоган', value: 'Сумки из натуральной итальянской кожи. Минимум пафоса — максимум качества. Из Италии.' },
  { key: 'hero.subtitle', label: 'Хиро: подзаголовок', value: 'Кожаные сумки на каждый день' },
  { key: 'hero.button', label: 'Кнопка в хиро', value: 'Смотреть коллекцию' },
  { key: 'home.newSubtitle', label: 'Главная: подпись над новинками', value: 'Свежие поступления натуральной кожи. То, что появилось совсем недавно.' },
  { key: 'home.featuredSubtitle', label: 'Главная: подпись над популярными', value: 'Модели, которые выбирают чаще всего. Каждая — из натуральной итальянской кожи.' },
  { key: 'home.categoriesSubtitle', label: 'Главная: подпись над коллекциями', value: 'Сумка на каждый день, вечерний выход или деловая встреча — форма найдётся для любого сценария.' },
  { key: 'cta.title', label: 'CTA внизу главной: заголовок', value: 'Сумки из натуральной кожи' },
  { key: 'cta.desc', label: 'CTA: описание (перед ним подставится число моделей)', value: 'моделей. Доставка по всей России.' },
]

export const siteContentData = {
  footer: {
    aboutText: blocksToRichText([
      { text: 'Moranti — авторские кожаные сумки ручной работы. Натуральная кожа, честное ремесло, доставка по России.' },
    ]),
    copyright: '© 2026 Moranti. Все права защищены.',
  },
  contacts: {
    phone: '+7 (495) 123-45-67',
    email: 'info@moranti.ru',
    address: 'Москва, ул. Тверская, 15',
    city: 'Москва',
    workHours: 'Ежедневно 10:00–21:00',
  },
  social: [],
}
