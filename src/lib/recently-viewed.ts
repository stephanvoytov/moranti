/* =============================================
   Recently Viewed — localStorage utility
   ============================================= */

const STORAGE_KEY = "moranti_recently_viewed";
const MAX_ITEMS = 10;

/* ——— Read ——— */

export function getRecentlyViewed(): number[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((n): n is number => typeof n === "number");
  } catch {
    return [];
  }
}

/* ——— Add ——— */

export function addRecentlyViewed(wbArticle: number): void {
  if (typeof window === "undefined") return;
  try {
    const current = getRecentlyViewed();
    const updated = [wbArticle, ...current.filter((id) => id !== wbArticle)].slice(
      0,
      MAX_ITEMS,
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // localStorage unavailable
  }
}

/* ——— Clear ——— */

export function clearRecentlyViewed(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // localStorage unavailable
  }
}
