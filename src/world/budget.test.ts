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

const triangles = (mesh: THREE.Mesh) => {
  const g = mesh.geometry;
  const tris = (g.index ? g.index.count : g.attributes.position.count) / 3;
  const inst = (mesh as THREE.InstancedMesh).isInstancedMesh
    ? (mesh as THREE.InstancedMesh).count
    : 1;
  return tris * inst;
};

/** Draw calls of one mesh in the main pass: one per material group, two for a
 * transparent double-sided material that three renders back then front. */
const mainCalls = (mesh: THREE.Mesh) => {
  const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
  let n = 0;
  for (const m of mats) {
    n += m.transparent && m.side === THREE.DoubleSide && !m.forceSinglePass ? 2 : 1;
  }
  return n;
};

/** What a High frame renders: the main pass, then the sun's shadow pass (spec 10). */
const measure = (roots: THREE.Object3D[]) => {
  const main = { calls: 0, triangles: 0 };
  const shadow = { calls: 0, triangles: 0 };
  const visit = (o: THREE.Object3D) => {
    // Smoke starts hidden but is on screen in steady state, so count it.
    if (!o.visible && o.userData.kind !== "smoke") return;
    const mesh = o as THREE.Mesh;
    if (mesh.isMesh) {
      main.calls += mainCalls(mesh);
      main.triangles += triangles(mesh);
      if (mesh.castShadow) {
        shadow.calls++;
        shadow.triangles += triangles(mesh);
      }
    }
    o.children.forEach(visit);
  };
  roots.forEach(visit);
  return { main, shadow };
};

describe("render budget (spec 10)", () => {
  it("fits High's main pass and shadow pass", () => {
    const w = buildWorld();
    const { main, shadow } = measure([w.town.root, ...Object.values(w.places)]);
    expect(main.calls).toBeLessThanOrEqual(250);
    expect(main.triangles).toBeLessThanOrEqual(300_000);
    expect(shadow.calls).toBeLessThanOrEqual(60);
    w.kit.dispose();
  });
});
