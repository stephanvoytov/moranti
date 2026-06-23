import { PrismaClient } from "@prisma/client";
const url = process.env.POSTGRES_PRISMA_URL;
console.log("URL:", url?.substring(0, 60) + "...");
const p = new PrismaClient({ datasources: { db: { url } } });
p.$queryRawUnsafe("SELECT 1 AS ok")
  .then((r) => console.log("DB OK:", JSON.stringify(r)))
  .catch((e) => console.log("DB FAIL:", e.message))
  .finally(() => p.$disconnect());
