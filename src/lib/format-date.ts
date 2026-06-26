/**
 * format-date.ts — утилиты форматирования дат без внешних зависимостей.
 */

const RU_RELATIVE: Record<string, string> = {
  justNow: "только что",
  minuteAgo: "1 минуту назад",
  minutesAgo: "мин. назад",
  hourAgo: "1 час назад",
  hoursAgo: "ч. назад",
  yesterday: "вчера",
  daysAgo: "дн. назад",
};

/**
 * Human-readable "time ago" on Russian.
 */
export function formatDistanceToNow(
  date: Date,
  options?: { addSuffix?: boolean; locale?: string }
): string {
  const now = Date.now();
  const diffMs = now - date.getTime();

  if (diffMs < 0) return "только что";

  const seconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return "только что";
  if (minutes === 1) return "1 минуту назад";
  if (minutes < 60) return `${minutes} ${minutesAgo(minutes)}`;
  if (hours === 1) return "1 час назад";
  if (hours < 24) return `${hours} ч. назад`;
  if (days === 1) return "вчера";
  if (days < 7) return `${days} дн. назад`;
  return date.toLocaleDateString("ru-RU");
}

function minutesAgo(m: number): string {
  // Простейшее склонение: 2, 3, 4 → "минуты", остальное → "минут"
  const last = m % 10;
  if (m >= 11 && m <= 19) return "минут";
  if (last === 1) return "минуту";
  if (last >= 2 && last <= 4) return "минуты";
  return "минут";
}
