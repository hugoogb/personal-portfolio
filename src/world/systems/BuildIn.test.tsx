import { describe, expect, it } from "vitest";
import { shouldPlayBuildIn } from "@/world/systems/BuildIn";

describe("shouldPlayBuildIn", () => {
  it("plays only on a first visit without reduced motion", () => {
    expect(shouldPlayBuildIn({ firstVisit: true, reducedMotion: false })).toBe(true);
    expect(shouldPlayBuildIn({ firstVisit: false, reducedMotion: false })).toBe(false);
    expect(shouldPlayBuildIn({ firstVisit: true, reducedMotion: true })).toBe(false);
  });
});
