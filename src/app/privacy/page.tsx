import type { Metadata } from "next";
import Link from "next/link";
import styles from "./page.module.css";
import { seoConfig } from "@/config/seo";
import { legalInfo, CONTACT_URLS } from "@/config/legal";
import { buildBreadcrumbJsonLd } from "@/lib/seo-jsonld";

const { title, description } = seoConfig.pages.privacy;

const siteUrl = process.env.SITE_URL || "http://localhost:3001";

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: "/privacy",
  },
  openGraph: {
    title: `${title} — Moranti`,
    description,
    url: "/privacy",
  },
};

export default function PrivacyPage() {
  return (
    <>
      {/* BreadcrumbList JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            buildBreadcrumbJsonLd(
              [
                { name: "Главная", path: "/" },
                { name: "Политика конфиденциальности", path: "/privacy" },
              ],
              siteUrl,
            ),
          ),
        }}
      />
      <div className={styles.page}>
        <nav className={styles.breadcrumb}>
          <Link href="/" className={styles.breadcrumbLink}>
            Главная
          </Link>
          <span className={styles.breadcrumbSep}>/</span>
          <span className={styles.breadcrumbCurrent}>
            Политика конфиденциальности
          </span>
        </nav>

        <section className={styles.hero}>
          <h1 className={styles.heroTitle}>Политика конфиденциальности</h1>
          <p className={styles.heroDesc}>
            Политика обработки персональных данных сайта Moranti. Редакция от
            5 августа 2026 года.
          </p>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionNumber}>01</span>
            <h2 className={styles.sectionTitle}>Общие положения</h2>
            <div className={styles.sectionRule} />
          </div>
          <div className={styles.body}>
            <p className={styles.text}>
              Настоящая политика описывает, какие данные обрабатываются при
              посещении сайта morantibags.ru и на каких основаниях это
              происходит. Политика разработана в соответствии с Федеральным
              законом № 152-ФЗ «О персональных данных».
            </p>
            <p className={styles.text}>
              Используя сайт, вы принимаете условия этой политики. Данные
              обрабатываются в обезличенном виде и не позволяют
              идентифицировать посетителя; ограничить обработку можно в любой
              момент (см. раздел «Как ограничить обработку данных»).
            </p>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionNumber}>02</span>
            <h2 className={styles.sectionTitle}>Оператор персональных данных</h2>
            <div className={styles.sectionRule} />
          </div>
          <div className={styles.body}>
            <p className={styles.text}>{legalInfo.operatorName}</p>
            <ul className={styles.list}>
              <li>ОГРНИП {legalInfo.ogrnip}</li>
              <li>ИНН {legalInfo.inn}</li>
            </ul>
            <p className={styles.text}>
              Сайт является каталогом-витриной: заказ, оплата, доставка и
              возврат осуществляются на маркетплейсах Wildberries и Ozon по их
              правилам. Персональные данные покупателей (имя, телефон, адрес
              доставки) обрабатывают маркетплейсы. Оператор их не собирает и не
              получает.
            </p>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionNumber}>03</span>
            <h2 className={styles.sectionTitle}>Какие данные обрабатываются</h2>
            <div className={styles.sectionRule} />
          </div>
          <div className={styles.body}>
            <ul className={styles.list}>
              <li>
                Технические данные — IP-адрес, тип и версия браузера,
                операционная система, источник перехода, просмотренные
                страницы. Необходимы для корректной работы сайта.
              </li>
              <li>
                Файлы cookie — технические (обеспечение работы сайта) и
                аналитические (измерение посещаемости).
              </li>
              <li>
                Обезличенные данные Яндекс.Метрики — просмотры страниц,
                источники переходов. Запись действий посетителя (вебвизор,
                карта кликов) не ведётся.
              </li>
              <li>
                Обезличенные данные Vercel Analytics — скорость загрузки
                страниц, ошибки, просмотры. Не позволяют идентифицировать
                пользователя.
              </li>
              <li>
                Список избранного — хранится в localStorage вашего браузера и
                на сервер не передаётся.
              </li>
            </ul>
            <p className={styles.text}>
              Единственная форма, запрашивающая e-mail, — «Задать вопрос»:
              адрес используется исключительно для ответа на обращение
              посетителя и никуда не передаётся. Иные персональные данные,
              позволяющие идентифицировать посетителя, оператором не
              запрашиваются.
            </p>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionNumber}>04</span>
            <h2 className={styles.sectionTitle}>Цели и правовые основания</h2>
            <div className={styles.sectionRule} />
          </div>
          <div className={styles.body}>
            <p className={styles.text}>
              Цели обработки: обеспечение работы сайта, анализ посещаемости и
              поведения посетителей, улучшение качества и удобства сайта,
              выявление технических ошибок.
            </p>
            <ul className={styles.list}>
              <li>
                Аналитические сервисы (Яндекс.Метрика, Vercel Analytics)
                обрабатывают только обезличенные данные посещаемости — запись
                действий посетителя не ведётся. Обработка осуществляется на
                основании законного интереса оператора (п. 5 ч. 1 ст. 6
                152-ФЗ) и согласия не требует.
              </li>
              <li>
                Технические данные обрабатываются как необходимые для
                функционирования сайта (ч. 1 ст. 6 152-ФЗ).
              </li>
            </ul>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionNumber}>05</span>
            <h2 className={styles.sectionTitle}>
              Cookie и аналитические сервисы
            </h2>
            <div className={styles.sectionRule} />
          </div>
          <div className={styles.body}>
            <ul className={styles.list}>
              <li>
                Яндекс.Метрика (ООО «Яндекс») — обезличенный счётчик
                посещаемости: просмотры страниц, источники переходов. Вебвизор
                и карта кликов отключены. Данные обрабатываются на серверах в
                Российской Федерации.
              </li>
              <li>
                Vercel Analytics (Vercel Inc., США) — обезличенная статистика
                производительности. В связи с расположением серверов возможна
                трансграничная передача обезличенных данных, не позволяющих
                идентифицировать пользователя.
              </li>
              <li>
                Состав и срок действия файлов cookie можно посмотреть и
                удалить в настройках браузера.
              </li>
            </ul>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionNumber}>06</span>
            <h2 className={styles.sectionTitle}>Сроки хранения данных</h2>
            <div className={styles.sectionRule} />
          </div>
          <div className={styles.body}>
            <ul className={styles.list}>
              <li>
                Технические данные — до достижения целей обработки, не дольше
                30 дней.
              </li>
              <li>
                Данные Яндекс.Метрики — в соответствии с условиями сервиса
                Яндекс.Метрики.
              </li>
              <li>Cookie — до истечения срока действия файла cookie.</li>
              <li>
                Обезличенные данные аналитики — до достижения целей обработки.
              </li>
            </ul>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionNumber}>07</span>
            <h2 className={styles.sectionTitle}>Права посетителя</h2>
            <div className={styles.sectionRule} />
          </div>
          <div className={styles.body}>
            <p className={styles.text}>
              В соответствии со ст. 14 Федерального закона № 152-ФЗ вы вправе:
            </p>
            <ul className={styles.list}>
              <li>получать информацию об обработке ваших данных;</li>
              <li>
                требовать уточнения, блокирования или удаления данных;
              </li>
              <li>требовать прекращения обработки данных;</li>
              <li>
                обжаловать действия оператора в Роскомнадзоре или в суде.
              </li>
            </ul>
            <p className={styles.text}>
              Для реализации прав напишите нам через VK:{" "}
              <a
                className={styles.link}
                href={CONTACT_URLS.vk}
                target="_blank"
                rel="noopener noreferrer"
              >
                vk.com/moranti_bags
              </a>
              .
            </p>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionNumber}>08</span>
            <h2 className={styles.sectionTitle}>Как ограничить обработку данных</h2>
            <div className={styles.sectionRule} />
          </div>
          <div className={styles.body}>
            <ul className={styles.list}>
              <li>
                Отключите cookie в настройках браузера — Яндекс.Метрика
                перестанет собирать данные посещаемости.
              </li>
              <li>
                Используйте режим инкогнито или блокировку сторонних cookie.
              </li>
              <li>Напишите нам через VK — рассмотрим обращение в течение 10 дней.</li>
            </ul>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionNumber}>09</span>
            <h2 className={styles.sectionTitle}>Изменения политики</h2>
            <div className={styles.sectionRule} />
          </div>
          <div className={styles.body}>
            <p className={styles.text}>
              Политика может обновляться при изменении законодательства или
              состава обрабатываемых данных. Актуальная редакция всегда
              публикуется на этой странице.
            </p>
          </div>
        </section>
      </div>
    </>
  );
}
