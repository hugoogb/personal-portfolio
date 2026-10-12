import { describe, expect, it } from "vitest";
import { ARRIVAL_S, arrivalPulse } from "@/world/lib/arrivals";

describe("arrivalPulse", () => {
  it("starts and ends dark, and peaks early", () => {
    expect(arrivalPulse(0)).toBe(0);
    expect(arrivalPulse(ARRIVAL_S)).toBe(0);
    expect(arrivalPulse(99)).toBe(0);
    expect(arrivalPulse(0.35)).toBeCloseTo(1, 1);
  });
});
