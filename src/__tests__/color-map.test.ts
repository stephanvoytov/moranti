import { describe, it, expect } from "vitest";
import { resolveColor, COLOR_MAP } from "@/lib/color-map";

describe("color-map", () => {
  it("returns correct hex for known colors", () => {
    expect(resolveColor("Чёрный")).toBe("#2C2420");
    expect(resolveColor("Белый")).toBe("#F0EDE5");
    expect(resolveColor("Шоколадный")).toBe("#5C3A1E");
    expect(resolveColor("Тауп")).toBe("#A89F91");
  });

  it('returns "#ccc" for unknown color', () => {
    expect(resolveColor("Фиолетовый")).toBe("#ccc");
  });

  it('returns "#ccc" for undefined', () => {
    expect(resolveColor(undefined)).toBe("#ccc");
  });

  it("has all valid hex strings in COLOR_MAP", () => {
    const hexRegex = /^#[0-9A-Fa-f]{6}$/;
    for (const [name, hex] of Object.entries(COLOR_MAP)) {
      expect(hex, `${name} → ${hex}`).toMatch(hexRegex);
    }
  });
});
