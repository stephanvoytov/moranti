/* =============================================
   Moranti — Lexical richText -> React
   Минимальный рендерер для контента Страниц.
   Поддерживает paragraph / heading / list / linebreak.
   ============================================= */

import React from "react";

export function RichText({ data }: { data: any }) {
  if (!data || !data.root) return null;
  return <>{renderNodes(data.root.children || [])}</>;
}

function renderNodes(nodes: any[]): React.ReactNode[] {
  return (nodes || []).map((n, i) => renderNode(n, i));
}

function renderNode(node: any, key: number): React.ReactNode {
  if (!node) return null;
  switch (node.type) {
    case "heading": {
      const Tag = (node.tag || "h2") as any;
      return <Tag key={key}>{renderText(node)}</Tag>;
    }
    case "paragraph":
      return <p key={key}>{renderText(node)}</p>;
    case "linebreak":
      return <br key={key} />;
    case "list": {
      const Tag = node.listType === "number" ? "ol" : "ul";
      return <Tag key={key}>{renderNodes(node.children || [])}</Tag>;
    }
    case "listitem":
      return <li key={key}>{renderText(node)}</li>;
    case "link": {
      const url = node.fields?.url || "#";
      const external = /^https?:\/\//i.test(url);
      return (
        <a
          key={key}
          href={url}
          {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        >
          {renderText(node)}
        </a>
      );
    }
    case "upload": {
      // Картинка, вставленная через «Загрузить картинку» (коллекция «Медиа»).
      // При depth>0 value — заполненный документ Media { url, alt, ... }.
      const v = node.value as any;
      if (!v || typeof v !== "object" || !v.url) return null;
      return (
        <img
          key={key}
          src={v.url as string}
          alt={(v.alt as string) || ""}
          loading="lazy"
        />
      );
    }
    default:
      if (node.text != null) return <span key={key}>{node.text}</span>;
      return null;
  }
}

function renderText(node: any): React.ReactNode {
  const children = node.children || [];
  if (children.length === 0) return node.text ?? "";
  return children.map((c: any, i: number) => {
    if (c.type === "text") return <React.Fragment key={i}>{c.text}</React.Fragment>;
    return renderNode(c, i);
  });
}
