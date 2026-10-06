import { describe, expect, it } from "vitest";
import { lighting } from "@/world/lib/lighting";
import { SUNRISE, SUNSET } from "@/world/lib/sun";

const NOON = (SUNRISE + SUNSET) / 2;

describe("lighting", () => {
  it("is full daylight with the sun overhead at solar noon", () => {
    const L = lighting(NOON);
    expect(L.day).toBe(1);
    expect(L.lit).toBe(0);
    expect(L.background).toBe("#bfe3ef");
    expect(L.water).toBe("#4f9fcf");
    expect(L.sun.intensity).toBeCloseTo(3.1, 5);
    expect(L.windows).toEqual({ bright: 0, dim: 0 });
    expect(L.stadium).toBe(0);
    expect(L.pools).toBe(0);
  });

  it("is a soft, readable night at midnight", () => {
    const L = lighting(0);
    expect(L.day).toBe(0);
    expect(L.lit).toBe(1);
    expect(L.background).toBe("#111d36");
    expect(L.water).toBe("#173049");
    expect(L.sun.color).toBe("#9db4ff");
    expect(L.sun.offset).toEqual([-12, 24, 18]);
    expect(L.hemi.intensity).toBeCloseTo(1.15, 5);
    expect(L.hemi.sky).toBe("#4a5f9c");
    expect(L.windows.bright).toBeCloseTo(0.95, 5);
    expect(L.windows.dim).toBeCloseTo(0.55, 5);
    expect(L.lamps).toBeCloseTo(1.25, 5);
    expect(L.signs).toBeCloseTo(0.3, 5);
    expect(L.stadium).toBeCloseTo(8, 5);
    expect(L.pools).toBeCloseTo(0.32, 5);
    expect(L.bloom).toBeCloseTo(0.42, 5);
    expect(L.board).toBeCloseTo(1.05, 5);
  });

  it("blends through dusk", () => {
    const L = lighting(SUNSET);
    expect(L.day).toBeGreaterThan(0);
    expect(L.day).toBeLessThan(1);
    expect(L.background).not.toBe("#bfe3ef");
    expect(L.background).not.toBe("#111d36");
  });

  it("brings the lights up steadily through the evening", () => {
    const hours = [18, 19, 19.5, 20, 21];
    const lits = hours.map((h) => lighting(h).lit);
    for (let i = 1; i < lits.length; i++) expect(lits[i]).toBeGreaterThanOrEqual(lits[i - 1]);
    expect(lits[0]).toBe(0);
    expect(lits[lits.length - 1]).toBe(1);
  });

  it("swings the sun across the sky from morning to evening", () => {
    // The reference's azimuth runs from pi at sunrise to 0 at sunset.
    expect(lighting(9).sun.offset[0]).toBeLessThan(0);
    expect(lighting(18).sun.offset[0]).toBeGreaterThan(0);
  });
});
