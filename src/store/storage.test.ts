import { describe, expect, it } from "vitest";
import { createSafeStorage } from "@/store/storage";

const backend = () => {
  const data = new Map<string, string>();
  return {
    getItem: (k: string) => data.get(k) ?? null,
    setItem: (k: string, v: string) => void data.set(k, v),
    removeItem: (k: string) => void data.delete(k),
  } as unknown as Storage;
};

describe("createSafeStorage", () => {
  it("reads and writes through to a working backend", () => {
    const real = backend();
    const storage = createSafeStorage(() => real);
    storage.setItem("k", "v");
    expect(real.getItem("k")).toBe("v");
    expect(storage.getItem("k")).toBe("v");
    storage.removeItem("k");
    expect(storage.getItem("k")).toBeNull();
  });

  it("falls back to memory when the backend throws", () => {
    const storage = createSafeStorage(() => {
      throw new Error("SecurityError");
    });
    expect(() => storage.setItem("k", "v")).not.toThrow();
    expect(storage.getItem("k")).toBe("v");
  });

  it("falls back to memory when there is no backend", () => {
    const storage = createSafeStorage(() => undefined);
    storage.setItem("k", "v");
    expect(storage.getItem("k")).toBe("v");
  });
});
