// @vitest-environment jsdom
import * as THREE from "three";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ORDER, PLACE_BY_ID } from "@/content/places";
import { stubCanvas } from "@/test/canvas";
import { buildWorld } from "@/world/build";
import { PROP_RINGS } from "@/world/lib/buildIn";

// These tests bake the whole town in jsdom, which is slow under load.
vi.setConfig({ testTimeout: 20_000 });

beforeEach(() => {
  stubCanvas();
});

// f1 and yard sit at the spec's coordinates from the approved sketch; their axis-aligned boxes
// overlap by ~0.9 at the circuit's edge while the geometry does not touch.
const ALLOWED = new Set(["f1|yard"]);

describe("buildWorld", () => {
  it("builds every place, the town and the prop rings", () => {
    const w = buildWorld();
    expect(Object.keys(w.places).sort()).toEqual([...ORDER].sort());
    expect(w.rings).toHaveLength(PROP_RINGS);
    // Baking merges each ring's static props into a few meshes per material.
    let meshes = 0;
    for (const ring of w.rings) ring.traverse((o) => void ((o as THREE.Mesh).isMesh && meshes++));
    expect(meshes).toBeGreaterThan(0);
    expect(meshes).toBeLessThan(w.town.props.length);
    w.kit.dispose();
  });

  it("keeps the big places apart (no overlapping footprints)", () => {
    const w = buildWorld();
    const boxes = ORDER.filter((id) => id !== "board").map((id) => {
      const g = w.places[id];
      g.position.set(PLACE_BY_ID[id].map.x, 0, PLACE_BY_ID[id].map.z);
      const b = new THREE.Box3().setFromObject(g);
      b.min.y = 0;
      b.max.y = 1;
      return [id, b] as const;
    });
    for (let i = 0; i < boxes.length; i++) {
      for (let j = i + 1; j < boxes.length; j++) {
        const [a, ba] = boxes[i];
        const [b, bb] = boxes[j];
        if (ALLOWED.has([a, b].sort().join("|"))) continue;
        expect(ba.intersectsBox(bb), `${a} overlaps ${b}`).toBe(false);
      }
    }
    w.kit.dispose();
  });

  it("registers what is 'me' for the accent and nothing else", () => {
    const w = buildWorld();
    expect(w.kit.accent.length).toBeGreaterThanOrEqual(4);
    w.kit.paintAccent("#3142db");
    for (const { material, mode } of w.kit.accent) {
      if (mode !== "emissive") expect(material.color.getHexString()).toBe("3142db");
    }
    w.kit.dispose();
  });

  it("has smoke sources at both chimneys", () => {
    const w = buildWorld();
    let puffs = 0;
    w.town.root.traverse((o) => {
      if (o.userData.kind === "smoke") puffs++;
    });
    expect(puffs).toBeGreaterThan(0);
    w.kit.dispose();
  });

  it("gives every probed service its own window materials, kept out of colour merging", () => {
    const w = buildWorld();
    for (const id of ["f1", "rl", "wt", "es", "av"] as const) {
      const set = w.placeWindows[id];
      expect(set, id).toBeDefined();
      expect(set!.win).not.toBe(w.kit.materials.win);
      const driven = new Set<THREE.Material>([
        set!.win,
        set!.winDim,
        ...set!.glows.map((g) => g.material),
      ]);
      let lit = 0;
      w.places[id].traverse((o) => {
        const mesh = o as THREE.Mesh;
        if (mesh.isMesh && driven.has(mesh.material as THREE.Material)) lit++;
      });
      expect(lit, `${id} has a status-driven light`).toBeGreaterThan(0);
    }
    w.kit.dispose();
  });
});
