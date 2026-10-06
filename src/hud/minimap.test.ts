import { describe, expect, it } from "vitest";
import { MINIMAP_SIZE, clientToMap, fromMap, toMap } from "@/hud/minimap";

describe("minimap projection", () => {
  it("puts the camera's up at the top of the map", () => {
    const up = toMap(-1, -1);
    expect(up.x).toBeCloseTo(0, 6);
    expect(up.y).toBeLessThan(0);
    const right = toMap(1, -1);
    expect(right.x).toBeGreaterThan(0);
    expect(right.y).toBeCloseTo(0, 6);
  });

  it("round-trips a ground point", () => {
    const m = toMap(5, -3);
    const g = fromMap(m.x, m.y);
    expect(g.x).toBeCloseTo(5, 6);
    expect(g.z).toBeCloseTo(-3, 6);
  });

  it("maps a click to map units from the element's box", () => {
    const rect = { left: 100, top: 50, width: 200, height: 200 };
    expect(clientToMap(200, 150, rect)).toEqual({ x: 0, y: 0 });
    expect(clientToMap(300, 250, rect)).toEqual({ x: MINIMAP_SIZE / 2, y: MINIMAP_SIZE / 2 });
  });
});
