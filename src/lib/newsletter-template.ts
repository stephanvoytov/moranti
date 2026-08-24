/* =============================================
   Moranti — HTML-шаблон рассылки.
   Фирменный стиль: кремовый фон, тёмная шапка,
   серифный логотип, золотые акценты.
   ============================================= */

import type { LexicalNode, LexicalRoot } from '@/lib/richtext'

export interface NewsletterTemplateOpts {
  /** Текст письма: Lexical richText, HTML или обычный текст */
  message: LexicalRoot | LexicalNode | string | null | undefined;
  /** Ссылка отписки для конкретного получателя */
  unsubscribeUrl?: string;
  /** Адрес сайта для футера */
  siteUrl?: string;
}

export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

type LexicalTemplateMessage = NewsletterTemplateOpts["message"];

/* ——— Lexical → HTML (для писем) ——— */

function textNodeHtml(n: LexicalNode): string {
  const esc = escapeHtml(String(n.text ?? ''))
  const f = Number(n.format ?? 0)
  let html = esc
  if (f & 16) html = `<code style="background:#F3EEE2;padding:1px 5px;">${html}</code>`
  if (f & 1) html = `<strong>${html}</strong>`
  if (f & 2) html = `<em>${html}</em>`
  if (f & 8) html = `<u>${html}</u>`
  if (f & 4) html = `<s>${html}</s>`
  return html
}

function childrenHtml(nodes?: LexicalNode[]): string {
  return (nodes ?? []).map(nodeToHtml).join('')
}

export function nodeToHtml(n: LexicalNode): string {
  switch (n.type) {
    case 'text':
      return textNodeHtml(n)
    case 'linebreak':
      return '<br/>'
    case 'link':
      return `<a href="${escapeHtml(String(n.url ?? '#'))}" style="color:#C49A6C;">${childrenHtml(n.children)}</a>`
    case 'heading': {
      const tag = ['h1', 'h2', 'h3'].includes(String(n.tag)) ? String(n.tag) : 'h2'
      return `<${tag} style="font-family:Georgia,'Times New Roman',serif;color:#1A1614;margin:0 0 14px;">${childrenHtml(n.children)}</${tag}>`
    }
    case 'quote':
      return `<blockquote style="border-left:3px solid #C49A6C;margin:0 0 16px;padding:4px 16px;color:#5B5345;">${childrenHtml(n.children)}</blockquote>`
    case 'list': {
      const tag = n.tag === 'ol' ? 'ol' : 'ul'
      const items = (n.children ?? [])
        .map((li) => `<li style="margin-bottom:6px;">${childrenHtml(li.children)}</li>`)
        .join('')
      return `<${tag} style="margin:0 0 16px;padding-left:22px;">${items}</${tag}>`
    }
    case 'horizontalrule':
      return `<div style="height:1px;background:#E3DCCB;margin:20px 0;"></div>`
    case 'listitem':
      return `<li>${childrenHtml(n.children)}</li>`
    case 'paragraph':
    default: {
      const inner = childrenHtml(n.children)
      if (!inner.trim()) return ''
      return `<p style="margin:0 0 16px;">${inner}</p>`
    }
  }
}

/** Lexical richText → HTML тела письма */
export function lexicalToHtml(root?: LexicalRoot | LexicalNode | null): string {
  if (!root || typeof root !== 'object') return ''
  const r = ('root' in (root as LexicalRoot) ? (root as LexicalRoot).root : root) as LexicalNode
  return childrenHtml(r.children)
}

/** Если в строке нет HTML-тегов — экранируем и превращаем переноды в <br/> */
function prepareMessage(message: LexicalTemplateMessage): string {
  if (message && typeof message === 'object') return lexicalToHtml(message as LexicalRoot | LexicalNode)
  const s = String(message ?? '')
  if (/<[a-z][\s\S]*>/i.test(s)) return s
  return escapeHtml(s).replace(/\n/g, '<br/>')
}

export function buildNewsletterHtml(opts: NewsletterTemplateOpts): string {
  const { unsubscribeUrl, siteUrl = "" } = opts;
  const body = prepareMessage(opts.message);

  const unsubscribeLine = unsubscribeUrl
    ? `<a href="${unsubscribeUrl}" style="color:#8A8272;">Отписаться от рассылки</a>`
    : `Отписаться: напишите нам на <a href="mailto:info@morantibags.ru?subject=%D0%9E%D1%82%D0%BF%D0%B8%D1%81%D0%BA%D0%B0" style="color:#8A8272;">info@morantibags.ru</a>`;

  return `<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>Moranti</title>
</head>
<body style="margin:0;padding:0;background:#EFE9DC;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#EFE9DC;">
  <tr>
    <td align="center" style="padding:32px 12px;">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background:#FFFFFF;border:1px solid #E3DCCB;">
        <tr>
          <td style="background:#2C2420;padding:30px 40px;text-align:center;">
            <span style="font-family:Georgia,'Times New Roman',serif;font-size:28px;letter-spacing:0.14em;color:#F5EFE3;">MORANTI</span>
            <div style="font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:0.18em;color:#C49A6C;margin-top:6px;">СУМКИ ИЗ НАТУРАЛЬНОЙ КОЖИ</div>
          </td>
        </tr>
        <tr>
          <td style="padding:36px 40px 8px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.75;color:#1A1614;">
            ${body}
          </td>
        </tr>
        <tr>
          <td style="padding:24px 40px 34px;">
            <div style="height:1px;background:#E3DCCB;margin-bottom:18px;"></div>
            <p style="margin:0 0 6px;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#8A8272;line-height:1.6;">
              ${siteUrl ? `Магазин: <a href="${siteUrl}" style="color:#8A8272;">morantibags.ru</a><br/>` : ""}
              Вы получили это письмо, потому что подписались на новости Moranti.
            </p>
            <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#8A8272;line-height:1.6;">
              ${unsubscribeLine}
            </p>
          </td>
        </tr>
      </table>
      <div style="font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#A79E8C;padding-top:14px;">
        © ${new Date().getFullYear()} Moranti · ИП Аугустан И.В. · ОГРНИП 312392620100191
      </div>
    </td>
  </tr>
</table>
</body>
</html>`;
}
