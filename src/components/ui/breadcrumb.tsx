import Link from "next/link";
import type { ReactNode } from "react";
import styles from "./breadcrumb.module.css";

interface Crumb {
  label: string;
  href?: string;
}

export default function Breadcrumb({ items }: { items: Crumb[] }) {
  return (
    <nav className={styles.breadcrumb}>
      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        return (
          <span key={i} className={styles.group}>
            {i > 0 && <span className={styles.sep}>/</span>}
            {item.href && !isLast ? (
              <Link href={item.href} className={styles.link}>
                {item.label}
              </Link>
            ) : (
              <span className={styles.current}>{item.label}</span>
            )}
          </span>
        );
      })}
    </nav>
  );
}
