import { describe, expect, it } from "vitest";
import { cheerLift, flashOn, sailOffset, waveLift } from "@/world/lib/eggs";

describe("eggs", () => {
  it("sails out and back", () => {
    expect(sailOffset(0).dx).toBeCloseTo(0, 9);
    expect(sailOffset(0).dz).toBeCloseTo(0, 9);
    const mid = sailOffset(0.5);
    expect(mid.dx).toBeCloseTo(9, 6);
    expect(mid.dz).toBeCloseTo(-5, 6);
    expect(sailOffset(1).dx).toBeCloseTo(0, 6);
  });

  it("flashes the cars at 10 Hz for the flash's duration", () => {
    expect(flashOn(0, 0.15)).toBe(false);
    const states = [0.05, 0.15, 0.25, 0.35].map((t) => flashOn(1, t));
    expect(states).toContain(true);
    expect(states).toContain(false);
  });

  it("lifts the seats the wave is passing, and nothing else", () => {
    const seat: [number, number, number] = [1, 0.5, 0];
    const lifts = Array.from({ length: 80 }, (_, i) => waveLift(i * 0.1, seat));
    expect(Math.max(...lifts)).toBeGreaterThan(0.9);
    expect(Math.min(...lifts)).toBe(0);
  });

  it("makes the fans jump only while cheering", () => {
    expect(cheerLift(0, 1, 3)).toBe(0);
    expect(cheerLift(1, 1, 3)).toBeGreaterThanOrEqual(0);
    expect(cheerLift(1, 1, 3)).toBeLessThanOrEqual(0.13);
  });
});
