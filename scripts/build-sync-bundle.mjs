#!/usr/bin/env node
/**
 * build-sync-bundle.mjs — собирает scripts/sync-all.mjs с esbuild
 * в один файл со всеми npm-зависимостями внутри.
 *
 * Вызывается из package.json `build` скрипта перед next build.
 * На Vercel это гарантирует, что sync-all.bundle.mjs не зависит
 * от node_modules на файловой системе.
 */

import { execSync } from "child_process";
import { existsSync, statSync } from "fs";

const OUT = "scripts/sync-all.bundle.mjs";

console.log(`[bundle] Сборка ${OUT}...`);

execSync(
  `npx esbuild scripts/sync-all.mjs --bundle --platform=node --format=esm --outfile=${OUT}`,
  { stdio: "inherit", cwd: process.cwd() }
);

const size = existsSync(OUT)
  ? Math.round(statSync(OUT).size / 1024) + "kb"
  : "unknown";

console.log(`[bundle] Готово: ${OUT} (${size})`);
