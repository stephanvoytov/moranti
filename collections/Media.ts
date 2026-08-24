import type { CollectionConfig } from 'payload'
import { put, del } from '@vercel/blob'

/* =============================================
   Moranti — Медиа (загрузка файлов)

   Хранилище:
   - есть BLOB_READ_WRITE_TOKEN → файлы уходят
     в Vercel Blob (префикс media/, как у уже
     используемых картинок hero);
   - токена нет (локальная разработка) → обычная
     папка ./media на диске.

   Официальный плагин @payloadcms/storage-vercel-blob
   не используется: Turbopack ломает его ESM-интероп
   («plugin is not a function» при инициализации).
   ============================================= */

const blobToken = process.env.BLOB_READ_WRITE_TOKEN

/** Безопасное имя файла: только буквы/цифры/точка/дефис/подчёркивание */
function safeName(name: string): string {
  return String(name || 'file').replace(/[^\w.\-]+/g, '_')
}

export const Media: CollectionConfig = {
  slug: 'media',
  labels: { singular: 'Файл', plural: 'Медиатека' },
  access: {
    read: () => true,
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user),
  },
  admin: {
    useAsTitle: 'alt',
    group: 'Контент',
    description: 'Изображения и файлы сайта (загружаются в облако/Vercel Blob).',
  },
  upload: {
    // Локальное хранилище — фолбэк, когда Blob-токена нет.
    staticDir: './media',
    disableLocalStorage: Boolean(blobToken),
    mimeTypes: ['image/*', 'application/pdf'],
  },
  hooks: {
    /* После сохранения документа: если есть файл и токен — заливаем в Blob
       и прописываем публичный URL. */
    afterChange: [
      async ({ doc, req }) => {
        const file = (req as unknown as { file?: { data?: Buffer; name?: string; mimeType?: string } })
          .file
        if (!blobToken || !file?.data) return doc

        const key = `media/${Date.now()}-${safeName(file.name || '')}`
        const { url } = await put(key, file.data, {
          access: 'public',
          addRandomSuffix: false,
          token: blobToken,
          contentType: file.mimeType,
        })

        return {
          ...doc,
          url,
          filename: key.split('/').pop(),
          thumbnailURL: url,
        }
      },
    ],

    /* При удалении документа удаляем и файл из Blob. */
    afterDelete: [
      async ({ doc }) => {
        if (!blobToken || !doc?.url?.includes('blob.vercel-storage.com')) {
          return
        }
        try {
          await del(doc.url, { token: blobToken })
        } catch (err) {
          req_logWarn(`Blob delete failed for ${doc.url}: ${(err as Error).message}`)
        }
      },
    ],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
      label: 'Alt-текст (описание изображения)',
    },
  ],
}

function req_logWarn(message: string) {
  // Небольшой хелпер, чтобы не тянуть логгер в клиентский бандл админки.
  if (typeof console !== 'undefined') {
    console.warn(`[media] ${message}`)
  }
}
