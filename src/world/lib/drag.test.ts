import { afterEach, describe, expect, it } from "vitest";
import { DRAG_THRESHOLD_PX, drag, wasDrag } from "@/world/lib/drag";

describe("drag", () => {
  afterEach(() => {
    drag.distance = 0;
  });

  it("treats a still pointer as a click", () => {
    drag.distance = 2;
    expect(wasDrag()).toBe(false);
  });

  it("treats travel past the threshold as a pan", () => {
    drag.distance = DRAG_THRESHOLD_PX + 1;
    expect(wasDrag()).toBe(true);
  });
});
