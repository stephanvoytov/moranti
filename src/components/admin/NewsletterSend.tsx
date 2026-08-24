"use client";

import { useEffect, useState } from "react";
import { useAllFormFields } from "@payloadcms/ui";
import { buildNewsletterHtml } from "@/lib/newsletter-template";
import { NEWSLETTER_PRESETS } from "@/lib/newsletter-templates";

const val = (fields: Record<string, unknown>, k: string): unknown => {
  const x = fields?.[k];
  if (x && typeof x === "object" && "value" in x) return (x as { value: unknown }).value;
  return x;
};

const SITE = "http://localhost:3000";

export function NewsletterSend() {
  const [fields, dispatchFields] = useAllFormFields() as [
    Record<string, unknown>,
    (action: { type: string; state?: unknown }) => void,
  ];
  const [activeCount, setActiveCount] = useState<number | null>(null);
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [result, setResult] = useState<string>("");
  const [previewHtml, setPreviewHtml] = useState<string>("");

  const subject = String(val(fields, "subject") ?? "");
  const messageRaw = val(fields, "message");

  // живое превью письма (с дебаунсом)
  useEffect(() => {
    const t = setTimeout(() => {
      setPreviewHtml(buildNewsletterHtml({ message: messageRaw as never, siteUrl: SITE }));
    }, 400);
    return () => clearTimeout(t);
  }, [subject, messageRaw]);

  useEffect(() => {
    fetch("/api/subscribers?where[status][equals]=active&limit=1&depth=0")
      .then((r) => r.json())
      .then((j) => setActiveCount(j?.totalDocs ?? 0))
      .catch(() => setActiveCount(null));
  }, []);

  const applyPreset = (id: string) => {
    const preset = NEWSLETTER_PRESETS.find((p) => p.id === id);
    if (!preset || typeof dispatchFields !== "function") return;
    const patch = (path: string, value: unknown) => {
      const existing = (fields?.[path] ?? {}) as Record<string, unknown>;
      return {
        ...existing,
        value,
        initialValue: value,
        valid: true,
        passesValidation: true,
      };
    };
    dispatchFields({
      type: "UPDATE_MANY",
      formState: {
        subject: patch("subject", preset.subject),
        message: patch("message", preset.message),
      },
    } as never);
    setStatus("idle");
    setResult("");
  };

  const send = async () => {
    const s = subject.trim();
    const hasMessage =
      messageRaw && typeof messageRaw === "object"
        ? JSON.stringify(messageRaw).length > 20
        : Boolean(String(messageRaw ?? "").trim());
    if (!s.trim() || !hasMessage) {
      setStatus("error");
      setResult("Заполните тему и текст письма (и сохраните черновик).");
      return;
    }
    if (!window.confirm(`Отправить письмо на ${activeCount ?? "?"} адрес(ов)?`)) return;

    setStatus("sending");
    setResult("");
    try {
      const r = await fetch("/api/newsletter/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject: s, message: messageRaw }),
      });
      const j = await r.json();
      if (j.ok) {
        setStatus("done");
        setResult(
          j.total === 0
            ? "Активных подписчиков нет — некому отправлять."
            : `Готово: отправлено ${j.sent} из ${j.total}${j.failed ? `, ошибок: ${j.failed}` : ""}.`,
        );
      } else {
        setStatus("error");
        setResult(j.error || "Ошибка отправки");
      }
    } catch (e) {
      setStatus("error");
      setResult(String(e));
    }
  };

  const btn =
    status === "sending"
      ? "Отправляем…"
      : status === "done"
        ? "Отправить повторно"
        : "Отправить всем активным";

  return (
    <div
      style={{
        padding: 18,
        background: "var(--theme-elevation-50, #fafafa)",
        border: "1px solid var(--theme-border-color, #e2e2e2)",
        borderRadius: 4,
        display: "flex",
        flexDirection: "column",
        gap: 14,
      }}
    >
      {/* ——— Готовые шаблоны ——— */}
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, color: "var(--theme-elevation-800, #333)" }}>
          Готовые шаблоны
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {NEWSLETTER_PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => applyPreset(p.id)}
              className="btn btn--style-secondary btn--size-small"
              style={{ cursor: "pointer" }}
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      {/* ——— Превью письма ——— */}
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, color: "var(--theme-elevation-800, #333)" }}>
          Предпросмотр письма
        </div>
        <iframe
          title="Предпросмотр письма"
          srcDoc={previewHtml}
          style={{
            width: "100%",
            height: 520,
            border: "1px solid var(--theme-border-color, #e2e2e2)",
            borderRadius: 4,
            background: "#EFE9DC",
          }}
        />
        <div style={{ fontSize: 12, opacity: 0.6, marginTop: 4 }}>
          Обновляется автоматически. Шапка, футер и отписка добавляются автоматически.
        </div>
      </div>

      {/* ——— Отправка ——— */}
      <div style={{ fontSize: 14, color: "var(--theme-elevation-800, #333)" }}>
        Активных подписчиков: <b>{activeCount === null ? "…" : activeCount}</b>
        <span style={{ opacity: 0.6, marginLeft: 8 }}>
          (в dev без SMTP письмо пишется в консоль сервера)
        </span>
      </div>

      <div>
        <button
          type="button"
          onClick={send}
          disabled={status === "sending"}
          className="btn btn--style-primary btn--size-medium"
          style={{ opacity: status === "sending" ? 0.6 : 1 }}
        >
          {btn}
        </button>
      </div>

      {result && (
        <div
          style={{
            fontSize: 13,
            color:
              status === "error"
                ? "var(--theme-error-500, #d23)"
                : "var(--theme-success-500, #0f7d4c)",
          }}
        >
          {result}
        </div>
      )}
    </div>
  );
}

export default NewsletterSend;
