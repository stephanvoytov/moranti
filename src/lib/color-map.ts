/** Color name → hex swatch for visual markers on product page */
export const COLOR_MAP: Record<string, string> = {
  "Бежевый": "#C9A882",
  "Белый": "#F0EDE5",
  "Бургунди": "#6E2C3D",
  "Винный": "#722F37",
  "Жёлтый": "#E8C84A",
  "Капучино": "#A58B72",
  "Карамельный": "#C68E5B",
  "Коричневый": "#6B4226",
  "Молочный шоколад": "#8B6B4A",
  "Песочный": "#D4BFA2",
  "Розовый": "#D4A0A0",
  "Серый": "#9E9E9E",
  "Синий": "#4A6A8A",
  "Тауп": "#A89F91",
  "Чёрный": "#2C2420",
  "Шоколадный": "#5C3A1E",
};

/** Resolve a color hex or fallback to a neutral gray */
export function resolveColor(name: string | undefined): string {
  if (!name) return "#ccc";
  const normalized = normalizeColorName(name);
  return COLOR_MAP[normalized] ?? "#ccc";
}

/** Normalize raw WB color names to canonical Russian names */
export function normalizeColorName(name: string): string {
  const map: Record<string, string> = {
    "желтый, лимонный, сливочный": "Жёлтый",
  };
  return map[name] ?? name;
}