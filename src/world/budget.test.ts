// @vitest-environment jsdom
import * as THREE from "three";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { stubCanvas } from "@/test/canvas";
import { buildWorld } from "@/world/build";

// These tests bake the whole town in jsdom, which is slow under load.
vi.setConfig({ testTimeout: 20_000 });

beforeEach(() => {
  stubCanvas();
});

/** Draw calls and triangles of everything a High frame renders (spec 10). */
const measure = (roots: THREE.Object3D[]) => {
  let calls = 0;
  let triangles = 0;
  const visit = (o: THREE.Object3D) => {
    if (!o.visible || o.layers.mask === 1 << 1) return;
    const mesh = o as THREE.Mesh;
    if (mesh.isMesh) {
      calls++;
      const g = mesh.geometry;
      const tris = (g.index ? g.index.count : g.attributes.position.count) / 3;
      const inst = (mesh as THREE.InstancedMesh).isInstancedMesh
        ? (mesh as THREE.InstancedMesh).count
        : 1;
      triangles += tris * inst;
    }
    o.children.forEach(visit);
  };
  roots.forEach(visit);
  return { calls, triangles };
};

describe("render budget (spec 10)", () => {
  it("fits High's draw calls and triangles", () => {
    const w = buildWorld();
    const { calls, triangles } = measure([w.town.root, ...Object.values(w.places)]);
    if (process.env.BUDGET_DEBUG) {
      const groups: Record<string, THREE.Object3D[]> = {
        places: Object.values(w.places),
        rings: w.rings,
        ground: w.kit.buildIn.ground ? [w.kit.buildIn.ground] : [],
      };
      const seen = new Set<THREE.Object3D>(Object.values(groups).flat());
      // "other" = the rest of the town root (roads, smoke, lights, ...)
      const other = measure(w.town.root.children.filter((c) => !seen.has(c)));
      console.log(
        "BUDGET",
        JSON.stringify({
          total: { calls, triangles },
          places: measure(groups.places),
          rings: measure(groups.rings),
          ground: measure(groups.ground),
          other,
        }),
      );
    }
    expect(calls).toBeLessThanOrEqual(250);
    expect(triangles).toBeLessThanOrEqual(300_000);
    w.kit.dispose();
  });
});
