"use client";

/* =============================================
   Moranti — Product Characteristics
   Плоская сетка, без сворачивания.
   Используется внутри таба «Характеристики».
   ============================================= */

import type { CharacteristicGroup } from "@/data/products";
import styles from "./product-characteristics.module.css";

interface Props {
  data: CharacteristicGroup[];
  composition?: string;
}

interface FieldDef {
  label?: string;
  highlight?: boolean;
}

/** Какие поля показываем в характеристиках, остальные — игнорируем */
const ALLOW_LIST: Record<string, FieldDef> = {
  "Фактура материала":      {},
  "Материал подкладки":     { label: "Подкладка" },
  "Карманы":                {},
  "Вид застежки":           { label: "Застёжка" },
  "Длина плечевого ремня":  { label: "Длина ремня" },
  "Страна производства":    { highlight: true },
};

/** Миниатюра флага Италии */
function ItalyFlag() {
  return (
    <span
      className={styles.italyBadge}
      style={{
        background:
          "linear-gradient(90deg, #009246 33.33%, #fff 33.33%, #fff 66.66%, #ce2b37 66.66%)",
      }}
      aria-label="Италия"
    />
  );
}

export default function ProductCharacteristics({ data, composition }: Props) {
  // Flatten groups & filter by allow-list
  const allOptions = data.flatMap((g) => g.options);

  const items: { name: string; value: string; highlight?: boolean }[] = [];

  // Composition first, if provided
  if (composition) {
    items.push({ name: "Состав", value: composition });
  }

  for (const opt of allOptions) {
    const def = ALLOW_LIST[opt.name];
    if (!def) continue;
    items.push({
      name: def.label || opt.name,
      value: opt.value,
      highlight: def.highlight ?? false,
    });
  }

  if (items.length === 0) return null;

  return (
    <div className={styles.grid}>
      {items.map((item) => (
        <div key={item.name} className={styles.item}>
          <span className={styles.label}>{item.name}</span>
          {item.highlight ? (
            <span className={styles.highlightValue}>
              {item.value}
              {item.value.toLowerCase().includes("итали") && <ItalyFlag />}
            </span>
          ) : (
            <span className={styles.value}>{item.value}</span>
          )}
        </div>
      ))}
    </div>
  );
}
