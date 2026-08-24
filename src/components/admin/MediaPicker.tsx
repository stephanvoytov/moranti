'use client'

import React from 'react'
import { useField, useListDrawer } from '@payloadcms/ui'
import type { Data } from 'payload'

/**
 * WooCommerce-подобный выбор изображения: вместо ручной вставки URL —
 * открывается библиотека медиа (коллекция `media`), выбранный файл
 * прописывается в текстовое поле как URL. Хранится всё так же строкой-URL,
 * поэтому витрина (которая читает `product.image` как URL) не ломается.
 */
export const MediaPicker: React.FC = () => {
  const { value, setValue } = useField<string>()
  const [ListDrawer, , { openDrawer, closeDrawer }] = useListDrawer({
    collectionSlugs: ['media'],
    uploads: true,
  })

  const url = typeof value === 'string' ? value : ''

  return (
    <div className="mp-media-picker">
      <div className="mp-media-picker__preview">
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt="" className="mp-media-picker__thumb" />
        ) : (
          <div className="mp-media-picker__empty">Нет изображения</div>
        )}
      </div>

      <div className="mp-media-picker__controls">
        <button type="button" className="mp-btn mp-btn--primary" onClick={() => openDrawer()}>
          Выбрать из медиа
        </button>
        {url ? (
          <button type="button" className="mp-btn" onClick={() => setValue('')}>
            Очистить
          </button>
        ) : null}
      </div>

      <input
        type="text"
        className="mp-media-picker__url"
        placeholder="Или вставьте URL изображения вручную"
        value={url}
        onChange={(e) => setValue(e.target.value)}
      />

      <ListDrawer
        onSelect={({ doc }: { doc: Data }) => {
          const docUrl = (doc as { url?: string })?.url
          if (docUrl) setValue(docUrl)
          closeDrawer()
        }}
      />
    </div>
  )
}
