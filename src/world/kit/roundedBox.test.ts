import * as THREE from "three";
import { RoundedBoxGeometry as ThreeRoundedBox } from "three/addons/geometries/RoundedBoxGeometry.js";
import { describe, expect, it } from "vitest";
import { RoundedBoxGeometry } from "@/world/kit/roundedBox";

const close = (a: THREE.BufferAttribute, b: THREE.BufferAttribute) => {
  expect(a.count).toBe(b.count);
  for (let i = 0; i < a.array.length; i++) expect(a.array[i]).toBeCloseTo(b.array[i], 5);
};

describe("RoundedBoxGeometry", () => {
  it.each([
    [1, 1, 1, 3, 0.1],
    [2.4, 0.6, 1.3, 3, 0.2],
    [0.3, 0.05, 0.8, 1, 0.02],
  ])("draws exactly three's triangles for %s x %s x %s", (w, h, d, seg, r) => {
    const ours = new RoundedBoxGeometry(w, h, d, seg, r);
    const theirs = new ThreeRoundedBox(w, h, d, seg, r);
    const flat = ours.toNonIndexed();
    for (const name of ["position", "normal", "uv"])
      close(
        flat.getAttribute(name) as THREE.BufferAttribute,
        theirs.getAttribute(name) as THREE.BufferAttribute,
      );
  });

  it("shares vertices: a 3-segment box has under a quarter of three's", () => {
    const ours = new RoundedBoxGeometry(1, 1, 1, 3, 0.1);
    const theirs = new ThreeRoundedBox(1, 1, 1, 3, 0.1);
    expect(ours.index).not.toBeNull();
    expect(ours.attributes.position.count * 4).toBeLessThan(theirs.attributes.position.count);
  });

  it("keeps its parameters through a clone, for the shadow proxy", () => {
    const g = new RoundedBoxGeometry(2, 1, 0.5, 3, 0.1).clone();
    expect(g.type).toBe("RoundedBoxGeometry");
    expect(g.parameters).toEqual({ width: 2, height: 1, depth: 0.5, segments: 3, radius: 0.1 });
  });
});
