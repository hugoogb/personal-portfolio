import { describe, expect, it } from "vitest";
import {
  SUNRISE,
  barcelonaHour,
  clockText,
  dayAmount,
  effectiveHour,
  nightAmount,
} from "@/world/lib/sun";

describe("sun", () => {
  it("reads the hour in Barcelona, across daylight saving", () => {
    expect(barcelonaHour(new Date("2026-10-06T10:00:00Z"))).toBe(12);
    expect(barcelonaHour(new Date("2026-12-01T10:00:00Z"))).toBe(11);
    expect(barcelonaHour(new Date("2026-03-29T01:30:00Z"))).toBe(3.5);
  });

  it("is full day at noon and full night at 2am", () => {
    expect(dayAmount(13)).toBe(1);
    expect(dayAmount(2)).toBe(0);
    expect(nightAmount(22)).toBe(1);
  });

  it("is part way at sunrise", () => {
    const d = dayAmount(SUNRISE);
    expect(d).toBeGreaterThan(0);
    expect(d).toBeLessThan(1);
  });

  it("formats the clock as HH:MM", () => {
    expect(clockText(9.5)).toBe("09:30");
    expect(clockText(0)).toBe("00:00");
    expect(clockText(23 + 59.6 / 60)).toBe("23:59");
  });
});

describe("effectiveHour", () => {
  it("prefers the override, else the real Barcelona hour", () => {
    const now = new Date("2026-10-06T10:00:00Z");
    expect(effectiveHour(23, now)).toBe(23);
    expect(effectiveHour(null, now)).toBe(12);
  });
});
