import { describe, expect, it } from "vitest";
import { isHexColor, readAccent, writeAccent } from "@/store/accent";
import { createSafeStorage } from "@/store/storage";

const memory = () => createSafeStorage(() => undefined);

describe("accent", () => {
  it("accepts only #rrggbb", () => {
    expect(isHexColor("#10b981")).toBe(true);
    expect(isHexColor("#10B981")).toBe(true);
    for (const bad of ["red", "#fff", "rgb(0,0,0)", "javascript:alert(1)", "", null, 7]) {
      expect(isHexColor(bad)).toBe(false);
    }
  });

  it("reads a stored accent, lowercased", () => {
    const storage = memory();
    storage.setItem("color", "#3142DB");
    expect(readAccent(storage)).toBe("#3142db");
  });

  it("falls back to the default for missing or garbage values", () => {
    const storage = memory();
    expect(readAccent(storage)).toBe("#f97316");
    storage.setItem("color", "not-a-colour");
    expect(readAccent(storage)).toBe("#f97316");
  });

  it("writes valid accents and ignores invalid ones", () => {
    const storage = memory();
    writeAccent("#8B5CF6", storage);
    expect(storage.getItem("color")).toBe("#8b5cf6");
    writeAccent("purple", storage);
    expect(storage.getItem("color")).toBe("#8b5cf6");
  });
});
