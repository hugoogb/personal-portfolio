// @vitest-environment jsdom
import * as THREE from "three";
import { beforeEach, describe, expect, it } from "vitest";
import { PLACE_BY_ID } from "@/content/places";
import type { PlaceId } from "@/content/types";
import { stubCanvas } from "@/test/canvas";
import { createKit, type Kit } from "@/world/kit/kit";
import { buildCircuit } from "@/world/places/circuit";
import { buildFactory } from "@/world/places/factory";
import { buildRestaurant } from "@/world/places/restaurant";
import { buildYard } from "@/world/places/yard";

beforeEach(() => {
  stubCanvas();
});

const CASES: [PlaceId, (kit: Kit) => THREE.Group][] = [
  ["f1", buildCircuit],
  ["es", buildRestaurant],
  ["av", buildFactory],
  ["yard", buildYard],
];

const size = (g: THREE.Object3D) => new THREE.Box3().setFromObject(g);

describe.each(CASES)("%s builder", (id, build) => {
  it("builds a group at the origin, about as tall as its label height", () => {
    const g = build(createKit());
    expect(g.position.toArray()).toEqual([0, 0, 0]);
    const box = size(g);
    const top = PLACE_BY_ID[id].map.top;
    expect(box.max.y).toBeLessThan(top + 2);
    expect(box.min.y).toBeGreaterThan(-0.2);
  });

  it("stays within a sensible footprint around its centre", () => {
    const box = size(build(createKit()));
    const r = PLACE_BY_ID[id].map.r;
    for (const v of [box.min.x, box.max.x, box.min.z, box.max.z]) {
      expect(Math.abs(v)).toBeLessThan(r + 2);
    }
  });
});

describe("circuit", () => {
  it("laps three cars", () => {
    const kit = createKit();
    buildCircuit(kit);
    const f1 = kit.life.f1 as { cars: { g: THREE.Object3D }[] };
    expect(f1.cars).toHaveLength(3);
    const p0 = f1.cars[0].g.position.clone();
    kit.frame(0.5, 0.5, { night: 0, lit: 0, tier: 3 });
    expect(f1.cars[0].g.position.distanceTo(p0)).toBeGreaterThan(0.01);
    expect(f1.cars[0].g.userData.dynamic).toBe(true);
  });
});

describe("chimneys", () => {
  it("restaurant and factory report a chimney for the smoke", () => {
    const kit = createKit();
    buildRestaurant(kit);
    buildFactory(kit);
    const ids = (kit.life.chimneys as { id: string }[]).map((c) => c.id).sort();
    expect(ids).toEqual(["av", "es"]);
  });
});

describe("factory", () => {
  it("stamps faces onto cubes on the belt", () => {
    const kit = createKit();
    buildFactory(kit);
    const fac = kit.life.fac as { cubes: { z: number }[] };
    const z0 = fac.cubes[0].z;
    kit.frame(0.2, 0.2, { night: 0, lit: 0, tier: 3 });
    expect(fac.cubes[0].z).not.toBe(z0);
  });
});

describe("server yard", () => {
  it("has instanced LEDs and a blinking antenna", () => {
    const kit = createKit();
    buildYard(kit);
    expect((kit.life.leds as THREE.InstancedMesh).isInstancedMesh).toBe(true);
    const antenna = kit.life.antenna as THREE.MeshStandardMaterial;
    kit.frame(0.1, 0, { night: 0, lit: 0, tier: 3 });
    const a = antenna.emissiveIntensity;
    kit.frame(0.1, 0.8, { night: 0, lit: 0, tier: 3 });
    expect(antenna.emissiveIntensity).not.toBe(a);
  });
});

describe("yard LEDs", () => {
  it("use one palette on both rows", () => {
    const kit = createKit();
    buildYard(kit);
    const leds = kit.life.leds as THREE.InstancedMesh;
    const c = new THREE.Color();
    for (let i = 0; i < leds.count; i++) {
      leds.getColorAt(i, c);
      expect(["4ade80", "1a3a2a", "60a5fa"]).toContain(c.getHexString());
    }
  });
});
