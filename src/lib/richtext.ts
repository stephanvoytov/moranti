/* =============================================
   Moranti — RichText helpers
   Payload 3 (Lexical) richText <-> plain text
   ============================================= */

export interface LexicalNode {
  type?: string
  text?: string
  children?: LexicalNode[]
  [k: string]: unknown
}

export interface LexicalRoot {
  root: LexicalNode
  [k: string]: unknown
}

/** Преобразовать обычный текст в Lexical richText (для записи в Payload) */
export function textToRichText(text?: string | null): LexicalRoot | null {
  if (text == null || String(text).trim() === '') return null
  return {
    root: {
      type: 'root',
      format: '',
      indent: 0,
      version: 1,
      direction: 'ltr',
      children: [
        {
          type: 'paragraph',
          format: '',
          indent: 0,
          version: 1,
          children: [{ type: 'text', text: String(text), version: 1 }],
        },
      ],
    },
  }
}

/** Блок контента: { tag } = заголовок, { list: [...] } = маркированный список, иначе абзац */
export type RichBlock = { tag?: string; text?: string; list?: string[] }

/** Собрать Lexical richText из блоков */
export function blocksToRichText(blocks?: RichBlock[]): LexicalRoot | null {
  if (!Array.isArray(blocks) || blocks.length === 0) return null
  const children = blocks.map((b) => {
    if (Array.isArray(b.list) && b.list.length > 0) {
      return {
        type: 'list',
        listType: 'bullet',
        format: '',
        indent: 0,
        version: 1,
        children: b.list.map((item) => ({
          type: 'listitem',
          format: '',
          indent: 0,
          version: 1,
          value: 1,
          children: [{ type: 'text', text: item, version: 1 }],
        })),
      }
    }
    const node: LexicalNode =
      b.tag
        ? {
            type: 'heading',
            tag: b.tag,
            format: '',
            indent: 0,
            version: 1,
            children: [{ type: 'text', text: b.text ?? '', version: 1 }],
          }
        : {
            type: 'paragraph',
            format: '',
            indent: 0,
            version: 1,
            children: [{ type: 'text', text: b.text ?? '', version: 1 }],
          }
    return node
  })
  return {
    root: {
      type: 'root',
      format: '',
      indent: 0,
      version: 1,
      direction: 'ltr',
      children,
    },
  }
}

/** Извлечь плоский текст из Lexical richText (для витрины) */
export function richTextToText(rt?: unknown): string {
  if (!rt) return ''
  if (typeof rt === 'string') return rt
  const root = (rt as { root?: LexicalNode }).root
  let out = ''
  const walk = (n?: LexicalNode) => {
    if (!n) return
    if (n.type === 'text' && typeof n.text === 'string') out += n.text
    if (Array.isArray(n.children)) n.children.forEach(walk)
    if (n.type === 'paragraph' || n.type === 'linebreak') out += '\n'
  }
  if (root) walk(root)
  return out.replace(/\n{2,}/g, '\n').trim()
}
