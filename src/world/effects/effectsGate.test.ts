import { describe, expect, it } from "vitest";
import { BLOOM_MIN, bloomOn, effectsEnabled } from "@/world/effects/effectsGate";
import { lighting } from "@/world/lib/lighting";

describe("effects (spec 5.5)", () => {
  it("run on High only", () => {
    expect([0, 1, 2, 3].map((t) => effectsEnabled(t as 0 | 1 | 2 | 3))).toEqual([
      false,
      false,
      false,
      true,
    ]);
  });

  it("bloom only above 0.04", () => {
    expect(BLOOM_MIN).toBe(0.04);
    expect(bloomOn(0)).toBe(false);
    expect(bloomOn(0.04)).toBe(false);
    expect(bloomOn(0.05)).toBe(true);
  });

  it("no bloom at noon, bloom at 23:00", () => {
    expect(bloomOn(lighting(13).bloom)).toBe(false);
    expect(bloomOn(lighting(23).bloom)).toBe(true);
    expect(lighting(23).bloom).toBeCloseTo(0.42 * lighting(23).lit, 9);
  });
});
