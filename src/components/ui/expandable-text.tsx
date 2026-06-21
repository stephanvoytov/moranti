"use client";

import { useState, useId } from "react";
import styles from "./expandable-text.module.css";

interface Props {
  text: string;
  maxLines?: number;
}

export default function ExpandableText({ text, maxLines = 3 }: Props) {
  const [expanded, setExpanded] = useState(false);
  const id = useId();

  if (!text) return null;

  return (
    <div className={styles.wrapper}>
      <p
        id={id}
        className={`${styles.text} ${expanded ? styles.expanded : styles.collapsed}`}
        style={{ "--max-lines": maxLines } as React.CSSProperties}
      >
        {text}
      </p>
      <button
        type="button"
        className={styles.toggle}
        aria-expanded={expanded}
        aria-controls={id}
        onClick={() => setExpanded((v) => !v)}
      >
        {expanded ? "Свернуть" : "Читать полностью"}
      </button>
    </div>
  );
}
