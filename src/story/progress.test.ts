import { describe, expect, it } from "vitest";
import { currentStop, measureCenters, stopProgress } from "@/story/progress";

const centers = measureCenters([
  { top: 0, height: 800 },
  { top: 800, height: 800 },
  { top: 1600, height: 1000 },
]); // [400, 1200, 2100]

describe("stopProgress", () => {
  it("finds the centres", () => expect(centers).toEqual([400, 1200, 2100]));
  it("is at the first stop at the top of the page", () =>
    expect(stopProgress(centers, 400)).toEqual({ index: 0, fraction: 0 }));
  it("blends between stops", () =>
    expect(stopProgress(centers, 800)).toEqual({ index: 0, fraction: 0.5 }));
  it("clamps above the first and below the last", () => {
    expect(stopProgress(centers, 0)).toEqual({ index: 0, fraction: 0 });
    expect(stopProgress(centers, 9999)).toEqual({ index: 2, fraction: 0 });
  });
  it("rounds to the nearest stop", () => {
    expect(currentStop({ index: 0, fraction: 0.49 })).toBe(0);
    expect(currentStop({ index: 0, fraction: 0.5 })).toBe(1);
  });
  it("re-measures to new centres after a resize", () => {
    const narrow = measureCenters([
      { top: 0, height: 600 },
      { top: 600, height: 900 },
    ]);
    expect(stopProgress(narrow, 1050)).toEqual({ index: 1, fraction: 0 });
  });
});
