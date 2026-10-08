import { describe, expect, it } from "vitest";
import { ambientOn, trafficCaps } from "@/world/lib/ambient";
import { CAPS } from "@/world/traffic/model";

describe("reduced motion in the town (spec 9.7)", () => {
  it("keeps ambient animation only without reduced motion", () => {
    expect(ambientOn(false)).toBe(true);
    expect(ambientOn(true)).toBe(false);
  });

  it("sends no packets under reduced motion, and the tier caps otherwise", () => {
    for (const t of [0, 1, 2, 3] as const) {
      expect(trafficCaps(t, false)).toEqual(CAPS[t]);
      expect(trafficCaps(t, true)).toEqual({ req: 0, res: 0 });
    }
  });
});
