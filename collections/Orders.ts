import type { CollectionConfig } from 'payload'
import { sendMail } from '@/lib/mailer'

const STATUS_LABELS: Record<string, string> = {
  new: 'Новый',
  processing: 'В обработке',
  completed: 'Выполнен',
  cancelled: 'Отменён',
  refunded: 'Возврат',
}

const PAYMENT_LABELS: Record<string, string> = {
  pending: 'Ожидает оплаты',
  paid: 'Оплачен',
  failed: 'Ошибка оплаты',
  refunded: 'Возврат средств',
}

export const Orders: CollectionConfig = {
  slug: 'orders',
  defaultSort: '-createdAt',
  labels: { singular: 'Заказ', plural: 'Заказы' },
  admin: {
    useAsTitle: 'orderNumber',
    defaultColumns: ['orderNumber', 'customer', 'status', 'total', 'paymentStatus', 'createdAt'],
    group: 'Магазин',
    description: 'Заказы из витрины: статусы, оплата, позиции и доставка.',
  },
  hooks: {
    beforeChange: [
      async ({ data }) => {
        if (!data.orderNumber) {
          data.orderNumber = `MOR-${Date.now().toString().slice(-8)}`
        }
        // Воркфлоу: оплаченный заказ сразу уходит в обработку
        if (data.paymentStatus === "paid" && (!data.status || data.status === "new")) {
          data.status = "processing"
        }
        return data
      },
    ],
    afterChange: [
      async ({ doc, previousDoc, req }) => {
        if (!previousDoc) return doc
        const statusChanged = previousDoc.status !== doc.status
        const paymentChanged = previousDoc.paymentStatus !== doc.paymentStatus
        if (!statusChanged && !paymentChanged) return doc

        const email = typeof doc.email === "string" ? doc.email : undefined
        if (!email) return doc

        const statusLabel = STATUS_LABELS[doc.status as string] || doc.status
        const paymentLabel =
          PAYMENT_LABELS[doc.paymentStatus as string] ||
          doc.paymentStatus

        try {
          await sendMail({
            to: email,
            subject: `Заказ №${doc.orderNumber} — ${statusLabel}`,
            html: `
              <h2>Заказ №${doc.orderNumber}</h2>
              <p>Статус вашего заказа обновлён:</p>
              <p>Статус: <b>${statusLabel}</b></p>
              <p>Оплата: <b>${paymentLabel}</b></p>
              <p>Спасибо, что выбрали Moranti — натуральная кожа ручной работы.</p>
            `,
          })
        } catch (e) {
          req.payload.logger.error(
            "Order status notification failed: " + (e as Error)?.message,
          )
        }
        return doc
      },
    ],
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Заказ',
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
          ],
        },
        {
          label: 'Позиции',
          fields: [
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
          ],
        },
        {
          label: 'Оплата и доставка',
          fields: [
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
          ],
        },
        {
          label: 'Комментарий',
          fields: [
            { name: 'notes', type: 'textarea', label: 'Комментарий' },
          ],
        },
      ],
    },
  ],
}
