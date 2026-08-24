"use client";

import { useAllFormFields } from "@payloadcms/ui";

export function ProductPreview() {
  type FormFields = Record<string, unknown>;
  const [fields] = useAllFormFields() as [FormFields, unknown];

  const val = (k: string): unknown => {
    const x = fields?.[k];
    if (x && typeof x === "object" && "value" in x) return (x as { value: unknown }).value;
    return x;
  };

  const name = val("name") as string | undefined;
  const slug = val("slug") as string | undefined;
  const image = val("image") as string | undefined;
  const price = (val("directPrice") as number | undefined) ?? (val("price") as number | undefined);
  const inStock = val("inStock") as boolean | undefined;
  const isDirectSale = val("isDirectSale") as boolean | undefined;
  const iframeSrc = slug ? `/catalog/${slug}` : null;

  return (
    <div style={{ marginBottom: 16 }}>
      <div
        style={{
          display: "flex",
          gap: 16,
          alignItems: "center",
          padding: 16,
          background: "#faf8f3",
          border: "1px solid #ece6d8",
          borderRadius: 12,
        }}
      >
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt={name || ""}
            style={{
              width: 88,
              height: 88,
              objectFit: "cover",
              borderRadius: 8,
              border: "1px solid #ddd6c7",
            }}
          />
        ) : (
          <div
            style={{
              width: 88,
              height: 88,
              borderRadius: 8,
              background: "#efe9dc",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#8a7d5e",
              fontSize: 12,
            }}
          >
            нет фото
          </div>
        )}
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 16, fontWeight: 600, color: "#2a2419" }}>
            {name || "—"}
          </div>
          {price != null && (
            <div style={{ fontSize: 15, color: "#3250a8", fontWeight: 600 }}>
              {price.toLocaleString("ru-RU")} ₽
            </div>
          )}
          <div style={{ fontSize: 13, color: "#5b5345", marginTop: 4 }}>
            {slug ? `/catalog/${slug}` : "нет ЧПУ"}
          </div>
        </div>
        <div style={{ fontSize: 12, color: "#5b5345", textAlign: "right" }}>
          <div>{inStock ? "В наличии" : "Нет в наличии"}</div>
          <div>{isDirectSale ? "Прямая продажа" : "Маркетплейсы"}</div>
        </div>
      </div>

      {iframeSrc ? (
        <a
          href={iframeSrc}
          target="_blank"
          rel="noreferrer"
          style={{
            display: "inline-block",
            marginTop: 10,
            fontSize: 13,
            color: "#3250a8",
            fontWeight: 600,
            textDecoration: "none",
          }}
        >
          Открыть товар на сайте ↗
        </a>
      ) : (
        <p style={{ marginTop: 12, color: "#8a7d5e", fontSize: 13 }}>
          Сохраните товар с заполненным ЧПУ, чтобы увидеть ссылку на сайт.
        </p>
      )}
    </div>
  );
}
