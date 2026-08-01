import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // CJS/JS-скрипты используют require() по назначению
  {
    files: ["**/*.cjs", "**/*.js"],
    rules: {
      "@typescript-eslint/no-require-imports": "off",
    },
  },
  // Тесты: моки и кастомные типы оправдывают any
  {
    files: ["**/*.test.ts", "**/*.test.tsx"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unsafe-function-type": "off",
    },
  },
  // Админка: <img> для превью с внешних CDN (WB/Ozon) — next/image не настроен
  // на remotePatterns этих CDN, использование осознанное
  {
    files: ["src/app/admin/**"],
    rules: {
      "@next/next/no-img-element": "off",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Сгенерированный esbuild-бандл синхронизации (219 КБ, не исходник)
    "scripts/sync-all.bundle.mjs",
    // Временные файлы и архивные скрипты
    ".opencode/**",
    ".tmp/**",
    "tmp/**",
    "scripts/_archive/**",
    // Бинарный файл (парсер ломается)
    "scripts/test-old-sync.mjs",
  ]),
]);

export default eslintConfig;
