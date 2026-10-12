import { describe, expect, it } from "vitest";
import { PLACES } from "@/content/places";
import {
  BUILD_IN_S,
  PROP_RINGS,
  groundY,
  placeScale,
  ringOf,
  ringRise,
  roadScale,
} from "@/world/lib/buildIn";

describe("build-in timeline (spec 5.4)", () => {
  it("raises the ground in the first 0.45 s", () => {
    expect(groundY(0)).toBe(-2.2);
    expect(groundY(0.45)).toBeCloseTo(0, 6);
    expect(groundY(1)).toBe(0);
  });

  it("draws the roads out between 0.30 and 0.75 s", () => {
    expect(roadScale(0.3)).toBeLessThan(0.01);
    expect(roadScale(0.75)).toBeCloseTo(1, 6);
  });

  it("pops places from HQ outward, all settled by the end", () => {
    const hq = PLACES.find((p) => p.id === "hq")!.map;
    const board = PLACES.find((p) => p.id === "board")!.map;
    expect(placeScale(0.5, hq.x, hq.z)).toBeLessThan(0.05);
    const t = 0.9;
    expect(placeScale(t, hq.x, hq.z)).toBeGreaterThan(placeScale(t, board.x, board.z));
    for (const p of PLACES) expect(placeScale(BUILD_IN_S, p.map.x, p.map.z)).toBeCloseTo(1, 6);
  });

  it("raises prop rings from the centre outward, all down by the end", () => {
    expect(ringOf(0, 0)).toBe(0);
    expect(ringOf(17, 13)).toBe(PROP_RINGS - 1);
    expect(ringRise(0.8, 0)).toBeLessThan(0);
    expect(ringRise(0.8, 0)).toBeLessThanOrEqual(-2.3);
    for (let r = 0; r < PROP_RINGS; r++) expect(ringRise(BUILD_IN_S, r)).toBeCloseTo(0, 6);
  });
});
