import Link from "next/link";
import type { ReactNode, MouseEventHandler } from "react";
import styles from "./Button.module.css";

type Variant = "primary" | "outline";

interface ButtonProps {
  variant?: Variant;
  href?: string;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  fullWidth?: boolean;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  children: ReactNode;
  className?: string;
}

export default function Button({
  variant = "primary",
  href,
  type = "button",
  disabled = false,
  fullWidth = false,
  onClick,
  children,
  className = "",
}: ButtonProps) {
  const cls = [styles.btn, styles[variant], fullWidth ? styles.full : "", className]
    .filter(Boolean)
    .join(" ");

  if (href && !disabled) {
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} className={cls} disabled={disabled} onClick={onClick}>
      {children}
    </button>
  );
}
