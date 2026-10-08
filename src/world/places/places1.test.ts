// @vitest-environment jsdom
import * as THREE from "three";
import { beforeEach, describe, expect, it } from "vitest";
import { PLACE_BY_ID } from "@/content/places";
import type { PlaceId } from "@/content/types";
import { stubCanvas } from "@/test/canvas";
import { createKit, type Kit } from "@/world/kit/kit";
import { buildGift } from "@/world/places/gift";
import { buildHq } from "@/world/places/hq";
import { buildLibrary } from "@/world/places/library";
import { buildPostOffice } from "@/world/places/postOffice";

beforeEach(() => {
  stubCanvas();
});

const CASES: [PlaceId, (kit: Kit) => THREE.Group][] = [
  ["hq", buildHq],
  ["rl", buildLibrary],
  ["post", buildPostOffice],
  ["wt", buildGift],
];

const size = (g: THREE.Object3D) => new THREE.Box3().setFromObject(g);

describe.each(CASES)("%s builder", (id, build) => {
  it("builds a group at the origin, about as tall as its label height", () => {
    const g = build(createKit());
    expect(g.position.toArray()).toEqual([0, 0, 0]);
    const box = size(g);
    const top = PLACE_BY_ID[id].map.top;
    expect(box.max.y).toBeGreaterThan(top - 2);
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

describe("HQ", () => {
  it("wears the accent on its 'me' parts", () => {
    const kit = createKit();
    const before = kit.accent.length;
    buildHq(kit);
    expect(kit.accent.length - before).toBeGreaterThanOrEqual(2);
    kit.paintAccent("#10b981");
    expect(kit.materials.accentRoof.color.getHexString()).toBe("10b981");
  });

  it("waves its flag", () => {
    const kit = createKit();
    const g = buildHq(kit);
    const dynamic: THREE.Object3D[] = [];
    g.traverse((o) => {
      if (o.userData.dynamic) dynamic.push(o);
    });
    expect(dynamic.length).toBeGreaterThan(0);
    expect(dynamic.some((o) => (o as THREE.Mesh).material === kit.materials.accentFlag)).toBe(true);
    const r0 = dynamic.map((o) => o.rotation.y);
    kit.frame(0.1, 0.4, { night: 0, lit: 0, tier: 3 });
    expect(dynamic.map((o) => o.rotation.y)).not.toEqual(r0);
  });
});

describe("gift", () => {
  it("keeps lifting its lid", () => {
    const kit = createKit();
    buildGift(kit);
    const hinge = (kit.life.gift as { hinge: THREE.Object3D }).hinge;
    expect(hinge.userData.dynamic).toBe(true);
    kit.frame(0.1, 0, { night: 0, lit: 0, tier: 3 });
    const a = hinge.rotation.x;
    kit.frame(0.1, 1.4, { night: 0, lit: 0, tier: 3 });
    expect(hinge.rotation.x).not.toBe(a);
  });
});
