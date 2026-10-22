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

  it("never throws when the backend throws or is missing", () => {
    for (const storage of [
      createSafeStorage(() => {
        throw new Error("SecurityError");
      }),
      createSafeStorage(() => undefined),
    ]) {
      expect(() => storage.setItem("k", "v")).not.toThrow();
      expect(storage.getItem("k")).toBeNull();
      expect(() => storage.removeItem("k")).not.toThrow();
    }
  });
});
