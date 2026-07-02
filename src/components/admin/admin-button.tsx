"use client";

import Link from "next/link";
import styles from "./admin-button.module.css";

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";
type ButtonSize = "sm" | "md";

interface AdminButtonProps {
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  type?: "button" | "submit";
  className?: string;
  title?: string;
}

export default function AdminButton({
  children,
  variant = "primary",
  size = "md",
  href,
  onClick,
  disabled,
  loading,
  type = "button",
  className = "",
  title,
}: AdminButtonProps) {
  const cls = [
    styles.btn,
    styles[variant],
    styles[size],
    loading ? styles.loading : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  if (href) {
    return (
      <Link href={href} className={cls} title={title}>
        {children}
      </Link>
    );
  }

  return (
    <button
      className={cls}
      onClick={onClick}
      disabled={disabled || loading}
      type={type}
      title={title}
    >
      {loading && <span className={styles.spinner} />}
      {children}
    </button>
  );
}
