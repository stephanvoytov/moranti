/* =============================================
   Брендированная HTML-страница для API-ответов,
   на которые попадает человек по ссылке из письма
   (подтверждение/отписка). Вместо голого JSON.
   ============================================= */

import { NextResponse } from "next/server";

export function simpleHtmlPage(opts: { title: string; text: string; status: number }) {
  const { title, text, status } = opts;
  const html = `<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(title)} — Moranti</title>
<style>
  body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;background:#F6F4EF;color:#2C2420}
  .box{text-align:center;padding:48px 24px;max-width:520px}
  .logo{font-family:Georgia,'Times New Roman',serif;font-size:28px;letter-spacing:.04em;margin:0 0 32px}
  h1{font-family:Georgia,'Times New Roman',serif;font-weight:400;font-size:26px;margin:0 0 12px}
  p.txt{font-family:'Montserrat',Arial,sans-serif;font-size:14px;line-height:1.6;color:#6B5F58;margin:0 0 32px}
  a.btn{display:inline-block;padding:13px 30px;border:1px solid #8B6F5C;color:#8B6F5C;text-decoration:none;font-family:'Montserrat',Arial,sans-serif;font-size:12px;letter-spacing:.12em;text-transform:uppercase;transition:background .15s,color .15s}
  a.btn:hover{background:#8B6F5C;color:#fff}
</style>
</head>
<body>
<div class="box">
  <p class="logo">Moranti</p>
  <h1>${escapeHtml(title)}</h1>
  <p class="txt">${escapeHtml(text)}</p>
  <a class="btn" href="/">На главную</a>
</div>
</body>
</html>`;
  return new NextResponse(html, {
    status,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

function escapeHtml(s: string): string {
  return s.replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] ?? c,
  );
}
