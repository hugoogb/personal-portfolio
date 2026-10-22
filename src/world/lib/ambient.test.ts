import { describe, expect, it } from "vitest";
import { trafficCaps } from "@/world/lib/ambient";
import { CAPS } from "@/world/traffic/model";

describe("reduced motion in the town (spec 9.7)", () => {
  it("sends no packets under reduced motion, and the tier caps otherwise", () => {
    for (const t of [0, 1, 2, 3] as const) {
      expect(trafficCaps(t, false)).toEqual(CAPS[t]);
      expect(trafficCaps(t, true)).toEqual({ req: 0, res: 0 });
    }
  });
});
