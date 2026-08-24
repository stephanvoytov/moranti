import type { ChangeEvent, ReactNode } from "react";
import styles from "./Field.module.css";

interface FieldProps {
  label?: string;
  name: string;
  error?: string;
  hint?: string;
  as?: "input" | "textarea" | "select";
  type?: string;
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  required?: boolean;
  autoComplete?: string;
  disabled?: boolean;
  rows?: number;
  children?: ReactNode;
  className?: string;
}

export default function Field({
  label,
  name,
  error,
  hint,
  as = "input",
  type = "text",
  placeholder,
  value,
  defaultValue,
  onChange,
  required,
  autoComplete,
  disabled,
  rows,
  children,
  className = "",
}: FieldProps) {
  const id = `field-${name}`;
  const controlCls = [styles.control, error ? styles.controlError : ""]
    .filter(Boolean)
    .join(" ");

  const control =
    as === "textarea" ? (
      <textarea
        id={id}
        name={name}
        className={controlCls}
        placeholder={placeholder}
        value={value}
        defaultValue={defaultValue}
        onChange={onChange}
        required={required}
        disabled={disabled}
        rows={rows}
      />
    ) : as === "select" ? (
      <select
        id={id}
        name={name}
        className={controlCls}
        value={value}
        defaultValue={defaultValue}
        onChange={onChange}
        required={required}
        disabled={disabled}
      >
        {children}
      </select>
    ) : (
      <input
        id={id}
        name={name}
        type={type}
        className={controlCls}
        placeholder={placeholder}
        value={value}
        defaultValue={defaultValue}
        onChange={onChange}
        required={required}
        autoComplete={autoComplete}
        disabled={disabled}
      />
    );

  return (
    <div className={[styles.field, className].filter(Boolean).join(" ")}>
      {label && (
        <label htmlFor={id} className={styles.label}>
          {label}
        </label>
      )}
      {control}
      {hint && !error && <span className={styles.hint}>{hint}</span>}
      {error && <span className={styles.error}>{error}</span>}
    </div>
  );
}
