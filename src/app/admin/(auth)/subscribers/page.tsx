import prisma, { prismaQuery } from "@/lib/prisma";
import styles from "./subscribers.module.css";

interface Sub {
  email: string;
  confirmed: boolean;
  source: string;
  consentedAt: Date;
  confirmedAt: Date | null;
  unsubscribedAt: Date | null;
}

function fmt(d: Date | null | undefined): string {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleString("ru-RU", {
      dateStyle: "short",
      timeStyle: "short",
    });
  } catch {
    return String(d);
  }
}

function StatusBadge({ sub }: { sub: Sub }) {
  let cls = styles.statusPending;
  let label = "Ожидает";
  if (sub.unsubscribedAt) {
    cls = styles.statusUnsub;
    label = "Отписан";
  } else if (sub.confirmed) {
    cls = styles.statusOk;
    label = "Подтверждён";
  }
  return <span className={`${styles.status} ${cls}`}>{label}</span>;
}

export const dynamic = "force-dynamic";

export default async function AdminSubscribers() {
  const subs = (await prismaQuery(() =>
    prisma.subscriber.findMany({ orderBy: { createdAt: "desc" } }),
  )) as Sub[];

  const total = subs.length;
  const confirmed = subs.filter((s) => s.confirmed && !s.unsubscribedAt).length;
  const pending = subs.filter((s) => !s.confirmed && !s.unsubscribedAt).length;
  const unsub = subs.filter((s) => s.unsubscribedAt).length;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Подписчики</h1>
        <p className={styles.subtitle}>
          {total} всего · {confirmed} подтверждено · {pending} ожидают · {unsub} отписано
        </p>
      </header>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Список подписчиков</h2>
        </div>

        {subs.length === 0 ? (
          <div className={styles.emptyState}>Пока нет подписчиков.</div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Email</th>
                <th>Статус</th>
                <th>Источник</th>
                <th>Подписан</th>
                <th>Подтверждён</th>
                <th>Отписан</th>
              </tr>
            </thead>
            <tbody>
              {subs.map((s) => (
                <tr key={s.email}>
                  <td>{s.email}</td>
                  <td>
                    <StatusBadge sub={s} />
                  </td>
                  <td>{s.source}</td>
                  <td>{fmt(s.consentedAt)}</td>
                  <td>{fmt(s.confirmedAt)}</td>
                  <td>{fmt(s.unsubscribedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
