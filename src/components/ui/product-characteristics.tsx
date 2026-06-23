"use client";

/* =============================================
   Moranti — Product Characteristics
   Только полезные поля, скрыто по умолчанию,
   Италия подсвечена
   ============================================= */

import { useState, useId } from "react";
import type { CharacteristicGroup } from "@/data/products";
import styles from "./product-characteristics.module.css";

interface Props {
  data: CharacteristicGroup[];
}

interface FieldDef {
  /** display group: "details" | "dimensions" */
  group: "details" | "dimensions";
  /** label override (optional — keeps original if absent) */
  label?: string;
  /** highlight this field */
  highlight?: boolean;
}

/** Какие поля показываем, остальные — игнорируем */
const ALLOW_LIST: Record<string, FieldDef> = {
  "Фактура материала":     { group: "details" },
  "Материал подкладки":    { group: "details", label: "Подкладка" },
  "Карманы":               { group: "details" },
  "Вид застежки":          { group: "details", label: "Застёжка" },
  "Длина плечевого ремня": { group: "details", label: "Длина ремня" },
  "Страна производства":   { group: "details", highlight: true },
  "Высота предмета":       { group: "dimensions", label: "Высота" },
  "Ширина предмета":       { group: "dimensions", label: "Ширина" },
  "Глубина предмета":      { group: "dimensions", label: "Глубина" },
  "Вес товара без упаковки": { group: "dimensions", label: "Вес" },
};

/** Миниатюра флага Италии (CSS-градиент) */
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

export default function ProductCharacteristics({ data }: Props) {
  const [open, setOpen] = useState(false);
  const id = useId();

  // Flatten all groups into a single pool, filter by allow-list
  const allOptions = data.flatMap((g) => g.options);

  const details: { name: string; value: string; highlight?: boolean }[] = [];
  const dimensions: { name: string; value: string }[] = [];

  for (const opt of allOptions) {
    const def = ALLOW_LIST[opt.name];
    if (!def) continue;
    const item = { name: def.label || opt.name, value: opt.value, highlight: def.highlight };
    if (def.group === "dimensions") {
      dimensions.push(item);
    } else {
      details.push(item);
    }
  }

  if (details.length === 0 && dimensions.length === 0) return null;

  return (
    <div className={styles.wrapper}>
      <button
        type="button"
        className={`${styles.toggle} ${open ? styles.toggleOpen : ""}`}
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((v) => !v)}
      >
        Характеристики
        <span className={styles.toggleArrow}>▼</span>
      </button>

      <div
        id={id}
        className={`${styles.content} ${open ? styles.contentOpen : ""}`}
      >
        {/* Details grid */}
        <div className={styles.details}>
          {details.map((d) => (
            <div key={d.name} className={styles.item}>
              <span className={styles.itemLabel}>{d.name}</span>
              {d.highlight ? (
                <span className={styles.highlightValue}>
                  {d.value}
                  {d.value.toLowerCase().includes("итали") && <ItalyFlag />}
                </span>
              ) : (
                <span className={styles.itemValue}>{d.value}</span>
              )}
            </div>
          ))}
        </div>

        {/* Dimensions row */}
        {dimensions.length > 0 && (
          <div className={styles.dimensions}>
            {dimensions.map((d) => (
              <div key={d.name} className={styles.dimItem}>
                <span className={styles.dimValue}>{d.value}</span>
                <span className={styles.dimLabel}>{d.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
