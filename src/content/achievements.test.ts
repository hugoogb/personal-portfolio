import { describe, expect, it } from "vitest";
import { ACHIEVEMENTS, ACHIEVEMENT_BY_ID, ACHIEVEMENT_IDS } from "@/content/achievements";

describe("achievements", () => {
  it("lists the six from the spec, in order", () => {
    expect(ACHIEVEMENT_IDS).toEqual(["explorer", "goal", "hat", "lap", "night", "console"]);
  });

  it("names each one and keeps copy free of em and en dashes", () => {
    for (const a of ACHIEVEMENTS) {
      expect(a.name.length).toBeGreaterThan(0);
      expect(`${a.name} ${a.hint}`).not.toMatch(/[\u2013\u2014]/);
    }
    expect(ACHIEVEMENT_BY_ID.goal.name).toBe("Top corner");
  });
});
