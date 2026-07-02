"use client";

import { useEffect, useRef } from "react";
import styles from "./admin-modal.module.css";

export interface AdminModalAction {
  label: string;
  onClick: () => void;
  variant?: "default" | "danger" | "primary";
  disabled?: boolean;
}

interface AdminModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  actions?: AdminModalAction[];
}

export default function AdminModal({
  open,
  onClose,
  title,
  children,
  actions,
}: AdminModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className={styles.overlay}
      ref={overlayRef}
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      <div className={styles.modal} role="dialog" aria-modal="true" aria-label={title}>
        <div className={styles.header}>
          <h3 className={styles.title}>{title}</h3>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Закрыть">
            ✕
          </button>
        </div>
        <div className={styles.body}>{children}</div>
        {actions && actions.length > 0 && (
          <div className={styles.footer}>
            {actions.map((action, i) => (
              <button
                key={i}
                className={
                  action.variant === "danger"
                    ? styles.btnDanger
                    : action.variant === "primary"
                      ? styles.btnPrimary
                      : styles.btnDefault
                }
                onClick={action.onClick}
                disabled={action.disabled}
              >
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
