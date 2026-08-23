import type { CollectionConfig } from 'payload'

export const Orders: CollectionConfig = {
  slug: 'orders',
  labels: { singular: 'Заказ', plural: 'Заказы' },
  admin: { useAsTitle: 'orderNumber', defaultColumns: ['orderNumber', 'customer', 'status', 'total', 'createdAt'] },
  fields: [
    { name: 'orderNumber', type: 'text', label: 'Номер заказа', unique: true },
    {
      name: 'status',
      type: 'select',
      label: 'Статус',
      defaultValue: 'new',
      options: [
        { value: 'new', label: 'Новый' },
        { value: 'processing', label: 'В обработке' },
        { value: 'completed', label: 'Выполнен' },
        { value: 'cancelled', label: 'Отменён' },
        { value: 'refunded', label: 'Возврат' },
      ],
    },
    { name: 'customer', type: 'relationship', label: 'Покупатель', relationTo: 'customers' },
    { name: 'email', type: 'email', label: 'Email' },
    { name: 'phone', type: 'text', label: 'Телефон' },
    {
      name: 'items',
      type: 'array',
      label: 'Позиции',
      fields: [
        { name: 'product', type: 'relationship', label: 'Товар', relationTo: 'products' },
        { name: 'name', type: 'text', label: 'Название' },
        { name: 'price', type: 'number', label: 'Цена' },
        { name: 'quantity', type: 'number', label: 'Кол-во', defaultValue: 1 },
      ],
    },
    { name: 'subtotal', type: 'number', label: 'Сумма товаров' },
    { name: 'shippingCost', type: 'number', label: 'Доставка' },
    { name: 'total', type: 'number', label: 'Итого' },
    { name: 'shippingMethod', type: 'text', label: 'Способ доставки' },
    { name: 'address', type: 'text', label: 'Адрес доставки' },
    {
      name: 'paymentMethod',
      type: 'select',
      label: 'Способ оплаты',
      options: [
        { value: 'yookassa', label: 'ЮKassa (позже)' },
        { value: 'cod', label: 'Наложенный платёж' },
        { value: 'invoice', label: 'Счёт' },
      ],
    },
    {
      name: 'paymentStatus',
      type: 'select',
      label: 'Статус оплаты',
      defaultValue: 'pending',
      options: [
        { value: 'pending', label: 'Ожидает' },
        { value: 'paid', label: 'Оплачен' },
        { value: 'failed', label: 'Ошибка' },
      ],
    },
    { name: 'notes', type: 'textarea', label: 'Комментарий' },
  ],
}
