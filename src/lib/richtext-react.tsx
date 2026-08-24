/* =============================================
   Moranti — Lexical richText -> React
   Минимальный рендерер для контента Страниц.
   Поддерживает paragraph / heading / list / linebreak.
   ============================================= */

import React from "react";
import type { LexicalNode } from "./richtext";

export function RichText({ data }: { data: { root?: LexicalNode } }) {
  if (!data.root) return null;
  return <>{renderNodes(data.root.children || [])}</>;
}

function renderNodes(nodes: LexicalNode[]): React.ReactNode[] {
  return (nodes || []).map((n, i) => renderNode(n, i));
}

function renderNode(node: LexicalNode, key: number): React.ReactNode {
  if (!node) return null;
  switch (node.type) {
    case "heading": {
      const Tag = (node.tag || "h2") as React.ElementType;
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
      const url = String((node.fields as { url?: unknown })?.url || "#");
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
      const v = node.value as { url?: unknown; alt?: unknown };
      if (!v || typeof v !== "object" || !v.url) return null;
      return (
        <img
          key={key}
          src={String(v.url)}
          alt={String(v.alt ?? "")}
          loading="lazy"
        />
      );
    }
    default:
      if (node.text != null) return <span key={key}>{String(node.text)}</span>;
      return null;
  }
}

function renderText(node: LexicalNode): React.ReactNode {
  const children = node.children || [];
  if (children.length === 0) return String(node.text ?? "");
  return children.map((c, i: number) => {
    if (c.type === "text") return <React.Fragment key={i}>{String(c.text)}</React.Fragment>;
    return renderNode(c, i);
  });
}
