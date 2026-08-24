/* =============================================
   Moranti — готовые шаблоны рассылки.
   message — Lexical richText (как в редакторе),
   шапку/футер добавляет buildNewsletterHtml.
   ============================================= */

/* ——— мини-билдеры Lexical ——— */
type L = Record<string, unknown>

const T = (text: string, format = 0): L => ({ type: 'text', format, version: 1, text })
const P = (children: L[]): L => ({ type: 'paragraph', format: '', indent: 0, version: 1, children })
const H = (text: string): L => ({ type: 'heading', tag: 'h2', format: '', indent: 0, version: 1, children: [T(text)] })
const LINK = (url: string, label: string): L =>
  P([{ type: 'link', url, newTab: true, version: 1, children: [T(label)] }])

const ROOT = (children: L[]): L => ({
  root: { type: 'root', format: '', indent: 0, version: 1, direction: 'ltr', children },
})

const SITE = 'http://localhost:3000'

export interface NewsletterPreset {
  id: string;
  name: string;
  subject: string;
  message: L;
}

export const NEWSLETTER_PRESETS: NewsletterPreset[] = [
  {
    id: 'new',
    name: 'Новинки',
    subject: 'Новые сумки Moranti — уже в каталоге',
    message: ROOT([
      H('Новые модели уже в каталоге'),
      P([
        T('Мы добавили новые сумки из натуральной итальянской кожи — кросс-боди, тоут и багет. Каждая модель сшита вручную небольшими партиями, поэтому количество ограничено.'),
      ]),
      P([T('Загляните и выберите свою — доставка по всей России.')]),
      LINK(SITE + '/catalog', 'СМОТРЕТЬ КАТАЛОГ'),
    ]),
  },
  {
    id: 'sale',
    name: 'Скидка / акция',
    subject: 'Скидка 20% на сумки Moranti — только эта неделя',
    message: ROOT([
      H('Скидка 20% на всю коллекцию'),
      P([
        T('Только до конца недели — скидка 20% на сумки из натуральной кожи и замши. Промокод: '),
        T('MORANTI20', 1),
        T('.'),
      ]),
      P([T('Укажите его при оформлении заказа на сайте или скажите менеджеру.')]),
      LINK(SITE + '/catalog', 'ВЫБРАТЬ СУМКУ'),
    ]),
  },
  {
    id: 'thanks',
    name: 'Письмо подписчикам',
    subject: 'Спасибо, что вы с Moranti',
    message: ROOT([
      H('Небольшое письмо благодарности'),
      P([
        T('Спасибо, что подписались на новости Moranti. Мы шьём сумки из итальянской кожи вручную и не спамим — пишем только по делу: новинки, рестоки и редкие акции.'),
      ]),
      P([T('Если есть вопросы о материалах, уходе или доставке — просто ответьте на это письмо, мы читаем каждое.')]),
      LINK(SITE + '/catalog', 'НАШ КАТАЛОГ'),
    ]),
  },
]
