import { defineConfig } from "vitest/config";
import path from "path";
import dotenv from "dotenv";
import fs from "fs";

// Load .env.local so Prisma can find DATABASE_URL
const envPath = path.resolve(__dirname, ".env.local");
if (fs.existsSync(envPath)) dotenv.config({ path: envPath });

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/__tests__/setup.ts",
    testTimeout: 30000,
    // @payloadcms/ui (тянется из payload.config → DashboardWidgets) импортирует
    // CSS react-image-crop — в node-env это «Unknown file extension .css».
    // Инлайним пакет, чтобы vite обработал импорты (css-алиас ниже гасит .css)
    server: {
      deps: {
        inline: [/@payloadcms\/ui/, /react-image-crop/],
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      // Payload SDK импортирует конфиг по алиасу (как next.config.ts)
      "@payload-config": path.resolve(__dirname, "payload.config.ts"),
      // @payloadcms/ui импортирует CSS react-image-crop — в node-env это
      // ломает тесты («Unknown file extension .css»), отдаём пустой модуль
      "react-image-crop/dist/ReactCrop.css": path.resolve(
        __dirname,
        "src/__tests__/stubs/empty-module.ts",
      ),
    },
  },
});
