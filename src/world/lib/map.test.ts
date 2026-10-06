import { describe, expect, it } from "vitest";
import { PLACES } from "@/content/places";
import { HOMES, ISLAND, OVERVIEW, ROADS, roadRect } from "@/world/lib/map";

describe("map", () => {
  it("keeps every road on the island", () => {
    for (const road of ROADS) {
      for (const [x, z] of [road.from, road.to]) {
        expect(Math.abs(x)).toBeLessThanOrEqual(ISLAND.hx);
        expect(Math.abs(z)).toBeLessThanOrEqual(ISLAND.hz);
      }
    }
  });

  it("turns a road segment into a box footprint", () => {
    expect(roadRect(ROADS[0])).toEqual({ cx: 0, cz: 0, w: 35, d: 1 });
  });

  it("keeps the six homes clear of every place", () => {
    expect(HOMES).toHaveLength(6);
    for (const [hx, hz] of HOMES) {
      for (const p of PLACES) {
        expect(Math.hypot(hx - p.map.x, hz - p.map.z), p.id).toBeGreaterThan(p.map.r + 1.2);
      }
    }
  });

  it("frames the overview on the island", () => {
    expect(Math.abs(OVERVIEW.x)).toBeLessThan(ISLAND.hx);
    expect(Math.abs(OVERVIEW.z)).toBeLessThan(ISLAND.hz);
  });
});
