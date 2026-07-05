/**
 * Тесты для syncModels / syncOzonModels / archiveGoneProducts.
 *
 * Все функции зависят от Prisma — используем mock.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

const MODELS_PATH = "../../scripts/sync-modules/models.mjs";

type PrismaMock = ReturnType<typeof createMockPrisma>;

function createMockPrisma(): {
  model: {
    findFirst: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
  };
  product: {
    findFirst: ReturnType<typeof vi.fn>;
    findMany: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
  };
} {
  return {
    model: {
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    product: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
    },
  };
}

function makeLog() {
  return { lines: [], line: vi.fn(), write: vi.fn(), progress: vi.fn(), detail: vi.fn() };
}

// ================================================================
// syncModels
// ================================================================

describe("syncModels", () => {
  let syncModels: Function;
  let prisma: PrismaMock;
  let log: ReturnType<typeof makeLog>;

  beforeAll(async () => {
    const mod = await import(MODELS_PATH);
    syncModels = mod.syncModels;
  });

  beforeEach(() => {
    prisma = createMockPrisma();
    log = makeLog();
  });

  const resolveCategory = (card: any) => card.category || "crossbody";

  it("создаёт модель из imtId и привязывает товар", async () => {
    prisma.model.findFirst.mockResolvedValue(null);
    prisma.model.create.mockResolvedValue({ id: "model-wb-12345", slug: "model-wb-12345" });
    prisma.product.findMany.mockResolvedValue([
      { id: "mor-001", wbArticle: 111, sku: "mor-001", name: "Birkin Tote", modelId: null },
      { id: "mor-002", wbArticle: 222, sku: "mor-002", name: "Birkin Tote", modelId: null },
    ]);

    const cards = [
      { nmID: 111, imtID: 12345, imt_name: "Birkin", category: "tote" },
      { nmID: 222, imtID: 12345, imt_name: "Birkin", category: "tote" },
    ];
    const result = await syncModels(prisma, cards, resolveCategory, log, { dry: false });

    expect(result.created).toBe(1);
    expect(prisma.model.create).toHaveBeenCalledTimes(1);
    expect(prisma.model.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ imtId: BigInt(12345) }),
      }),
    );
    expect(prisma.product.update).toHaveBeenCalledTimes(2);
    expect(result.assigned).toBe(2);
  });

  it("нет imtId — ничего не делает", async () => {
    const cards = [{ nmID: 111 }]; // no imtID
    const result = await syncModels(prisma, cards, resolveCategory, log, { dry: false });

    expect(result.created).toBe(0);
    expect(result.assigned).toBe(0);
    expect(prisma.model.create).not.toHaveBeenCalled();
  });

  it("существующая модель — не создаёт заново", async () => {
    prisma.model.findFirst.mockResolvedValue({ id: "model-wb-12345", slug: "model-wb-12345" });
    prisma.product.findMany.mockResolvedValue([
      { id: "mor-001", wbArticle: 111, sku: "mor-001", name: "Birkin Tote", modelId: "model-wb-12345" },
      { id: "mor-002", wbArticle: 222, sku: "mor-002", name: "Birkin Tote", modelId: "model-wb-12345" },
    ]);

    const cards = [
      { nmID: 111, imtID: 12345, imt_name: "Birkin" },
      { nmID: 222, imtID: 12345, imt_name: "Birkin" },
    ];
    const result = await syncModels(prisma, cards, resolveCategory, log, { dry: false });

    expect(result.created).toBe(0);
    expect(prisma.model.create).not.toHaveBeenCalled();
    // modelId совпадает — update не нужен
    expect(prisma.product.update).not.toHaveBeenCalled();
  });

  it("dry mode — не пишет в БД", async () => {
    prisma.model.findFirst.mockResolvedValue(null);
    prisma.model.create.mockResolvedValue({ id: "model-wb-12345" });
    prisma.product.findMany.mockResolvedValue([
      { id: "mor-001", wbArticle: 111, sku: "mor-001", name: "Birkin Tote", modelId: null },
      { id: "mor-002", wbArticle: 222, sku: "mor-002", name: "Birkin Tote", modelId: null },
    ]);

    const cards = [
      { nmID: 111, imtID: 12345, imt_name: "Birkin" },
      { nmID: 222, imtID: 12345, imt_name: "Birkin" },
    ];
    const result = await syncModels(prisma, cards, resolveCategory, log, { dry: true });

    expect(result.created).toBe(1);               // created инкрементится
    expect(prisma.model.create).not.toHaveBeenCalled(); // dry блокирует create
    expect(result.assigned).toBe(0);               // model === null → assign не выполняется
    expect(prisma.product.update).not.toHaveBeenCalled(); // ничего не пишем
  });
});

// ================================================================
// syncOzonModels
// ================================================================

describe("syncOzonModels", () => {
  let syncOzonModels: Function;
  let prisma: PrismaMock;
  let log: ReturnType<typeof makeLog>;

  beforeAll(async () => {
    const mod = await import(MODELS_PATH);
    syncOzonModels = mod.syncOzonModels;
  });

  beforeEach(() => {
    prisma = createMockPrisma();
    log = makeLog();
  });

  it("создаёт модель из атрибута 9048 и привязывает товары", async () => {
    prisma.product.findMany.mockResolvedValue([
      { id: "mor-001", category: "saddle", modelId: null },
      { id: "mor-002", category: "saddle", modelId: null },
    ]);
    prisma.model.findFirst.mockResolvedValue(null);
    prisma.model.create.mockResolvedValue({ id: "model-ozon-sedlo", slug: "model-ozon-sedlo" });

    const attrMap = new Map([
      ["offer1", { attributes: [{ id: 9048, values: [{ value: "Sedlo" }] }] }],
      ["offer2", { attributes: [{ id: 9048, values: [{ value: "Sedlo" }] }] }],
    ]);

    const result = await syncOzonModels(prisma, attrMap, log);

    expect(result.created).toBe(1);
    expect(prisma.model.create).toHaveBeenCalledTimes(1);
    expect(result.assigned).toBe(2);
  });

  it("нет атрибута 9048 — ничего не делает", async () => {
    const attrMap = new Map([
      ["offer1", { attributes: [{ id: 20259, values: [{ value: "Crossbody" }] }] }],
    ]);

    const result = await syncOzonModels(prisma, attrMap, log);

    expect(result.created).toBe(0);
    expect(result.assigned).toBe(0);
    expect(prisma.model.create).not.toHaveBeenCalled();
  });

  it("существующая модель — не создаёт новую", async () => {
    prisma.product.findMany.mockResolvedValue([
      { id: "mor-001", category: "saddle", modelId: "model-ozon-sedlo" },
    ]);
    prisma.model.findFirst.mockResolvedValue({ id: "model-ozon-sedlo", slug: "model-ozon-sedlo" });

    const attrMap = new Map([
      ["offer1", { attributes: [{ id: 9048, values: [{ value: "Sedlo" }] }] }],
    ]);

    const result = await syncOzonModels(prisma, attrMap, log);

    expect(result.created).toBe(0);
    expect(result.assigned).toBe(0);
    expect(prisma.model.create).not.toHaveBeenCalled();
  });
});

// ================================================================
// archiveGoneProducts
// ================================================================

describe("archiveGoneProducts", () => {
  let archiveGoneProducts: Function;
  let prisma: PrismaMock;
  let log: ReturnType<typeof makeLog>;

  beforeAll(async () => {
    const mod = await import(MODELS_PATH);
    archiveGoneProducts = mod.archiveGoneProducts;
  });

  beforeEach(() => {
    prisma = createMockPrisma();
    log = makeLog();
  });

  const makeDb = (overrides = {}) => ({
    id: "mor-001",
    name: "Test Bag",
    wbArticle: BigInt(111),
    ozonArticle: BigInt(222),
    archivedAt: null,
    inStock: true,
    ...overrides,
  });

  it("товар есть на WB — не архивируется", async () => {
    const dbProducts = [makeDb()];
    const result = await archiveGoneProducts(
      prisma, dbProducts, [111], [], [], true, true, log, { dry: false },
    );

    expect(result.archived).toBe(0);
    expect(prisma.product.update).not.toHaveBeenCalled();
  });

  it("товар есть на Ozon — не архивируется", async () => {
    const dbProducts = [makeDb({ wbArticle: null })];
    const result = await archiveGoneProducts(
      prisma, dbProducts, [], [{ productSku: 222 }], [], true, true, log, { dry: false },
    );

    expect(result.archived).toBe(0);
    expect(prisma.product.update).not.toHaveBeenCalled();
  });

  it("товара нет нигде — архивируется", async () => {
    const dbProducts = [makeDb({ wbArticle: BigInt(999), ozonArticle: null })];
    const result = await archiveGoneProducts(
      prisma, dbProducts, [111], [], [999], true, true, log, { dry: false },
    );

    expect(result.archived).toBe(1);
    expect(prisma.product.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "mor-001" },
        data: expect.objectContaining({ archivedAt: expect.any(Date), inStock: false }),
      }),
    );
  });

  it("товар в корзине WB — архивируется", async () => {
    const dbProducts = [makeDb()];
    const result = await archiveGoneProducts(
      prisma, dbProducts, [], [], [111], true, true, log, { dry: false },
    );

    expect(result.archived).toBe(1);
  });

  it("товар вернулся на marketplace — восстанавливается", async () => {
    const dbProducts = [makeDb({ archivedAt: new Date("2024-01-01"), inStock: false })];
    const result = await archiveGoneProducts(
      prisma, dbProducts, [111], [], [], true, true, log, { dry: false },
    );

    expect(result.archived).toBe(0);
    expect(prisma.product.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "mor-001" },
        data: expect.objectContaining({ archivedAt: null, inStock: true }),
      }),
    );
  });

  it("dry mode — не архивирует", async () => {
    const dbProducts = [makeDb({ wbArticle: BigInt(999), ozonArticle: null })];
    const result = await archiveGoneProducts(
      prisma, dbProducts, [111], [], [999], true, true, log, { dry: true },
    );

    expect(result.archived).toBe(1);
    expect(prisma.product.update).not.toHaveBeenCalled();
  });

  it("wbChecked = false — товары с wbArticle не проверяются", async () => {
    const dbProducts = [makeDb()]; // wbArticle = 111, not in wbArticles
    const result = await archiveGoneProducts(
      prisma, dbProducts, [], [], [], false, true, log, { dry: false },
    );

    // wbChecked=false — skip products with wbArticle
    expect(result.archived).toBe(0);
    expect(prisma.product.update).not.toHaveBeenCalled();
  });

  it("ozonChecked = false — товары с ozonArticle не проверяются", async () => {
    const dbProducts = [makeDb({ wbArticle: null })]; // ozonArticle = 222, not in ozon items
    const result = await archiveGoneProducts(
      prisma, dbProducts, [], [], [], true, false, log, { dry: false },
    );

    expect(result.archived).toBe(0);
  });
});
