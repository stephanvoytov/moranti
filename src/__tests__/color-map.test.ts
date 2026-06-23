import { describe, it, expect } from "vitest";
import { resolveColor, getBasicColorName, BASIC_COLORS } from "@/lib/color-map";

describe("getBasicColorName", () => {
  it("returns basic color for single known color", () => {
    expect(getBasicColorName("черный")).toBe("Чёрный");
    expect(getBasicColorName("Чёрный")).toBe("Чёрный");
    expect(getBasicColorName("тауп")).toBe("Бежевый");
    expect(getBasicColorName("бургунди")).toBe("Бордовый");
    expect(getBasicColorName("шоколадный")).toBe("Коричневый");
  });

  it("handles compound colors from WB", () => {
    expect(getBasicColorName("тауп, капучино, бежевый")).toBe("Бежевый");
    expect(getBasicColorName("бордовый, бургунди, винный, марсала")).toBe("Бордовый");
    expect(getBasicColorName("шоколадный, коричневый, кофейный")).toBe("Коричневый");
    expect(getBasicColorName("желтый, лимонный, сливочный")).toBe("Жёлтый");
  });

  it("handles semicolon separator", () => {
    expect(getBasicColorName("тауп; капучино; бежевый")).toBe("Бежевый");
  });

  it("returns null for unknown", () => {
    expect(getBasicColorName("радужный")).toBeNull();
  });

  it("returns null for undefined/null", () => {
    expect(getBasicColorName(undefined)).toBeNull();
    expect(getBasicColorName(null)).toBeNull();
  });
});

describe("resolveColor", () => {
  it("returns correct hex for basic colors", () => {
    expect(resolveColor("Чёрный")).toBe("#2C2420");
    expect(resolveColor("Белый")).toBe("#F0EDE5");
    expect(resolveColor("Бежевый")).toBe("#C9A882");
  });

  it("returns correct hex for specific colors mapped to basic", () => {
    expect(resolveColor("тауп")).toBe("#C9A882"); // Бежевый
    expect(resolveColor("бургунди")).toBe("#6E2C3D"); // Бордовый
    expect(resolveColor("шоколадный")).toBe("#6B4226"); // Коричневый
  });

  it("handles compound colors", () => {
    expect(resolveColor("тауп, капучино, бежевый")).toBe("#C9A882");
    expect(resolveColor("бордовый, бургунди, винный")).toBe("#6E2C3D");
  });

  it('returns "#ccc" for unknown color', () => {
    expect(resolveColor("Фиолетовый")).toBe("#8A7BA8"); // actually known now
    expect(resolveColor("радужный")).toBe("#ccc");
  });

  it('returns "#ccc" for undefined', () => {
    expect(resolveColor(undefined)).toBe("#ccc");
  });

  it('returns "#ccc" for null', () => {
    expect(resolveColor(null)).toBe("#ccc");
  });
});

describe("BASIC_COLORS", () => {
  it("has 14 basic colors", () => {
    expect(BASIC_COLORS).toHaveLength(14);
  });

  it("has all valid hex strings", () => {
    const hexRegex = /^#[0-9A-Fa-f]{6}$/;
    for (const c of BASIC_COLORS) {
      expect(c.hex, `${c.label} → ${c.hex}`).toMatch(hexRegex);
    }
  });

  it("has unique sort keys", () => {
    const keys = BASIC_COLORS.map((c) => c.sortKey);
    expect(new Set(keys).size).toBe(keys.length);
  });
});
