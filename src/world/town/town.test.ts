// @vitest-environment jsdom
import * as THREE from "three";
import { beforeEach, describe, expect, it } from "vitest";
import { PLACES } from "@/content/places";
import { stubCanvas } from "@/test/canvas";
import { createKit } from "@/world/kit/kit";
import { HOMES } from "@/world/lib/map";
import { addSmoke, buildTown, isBlocked } from "@/world/town/town";

beforeEach(() => {
  stubCanvas();
});

const onRoad = (x: number, z: number) =>
  Math.abs(z) < 1.3 || (Math.abs(x) < 1.3 && z < 8.3) || Math.abs(z - 7) < 1.3;

describe("buildTown", () => {
  it("builds the ground group the build-in raises, and the water outside it", () => {
    const kit = createKit();
    const town = buildTown(kit);
    expect(kit.buildIn.ground).toBe(town.ground);
    expect(town.ground.parent).toBe(town.root);
    expect(town.water).toBeInstanceOf(THREE.MeshStandardMaterial);
    expect(kit.buildIn.roads.length).toBeGreaterThanOrEqual(3);
    for (const r of kit.buildIn.roads)
      expect(r.walk.userData.dynamic && r.asph.userData.dynamic).toBe(true);
  });

  it("plants about sixty trees, six homes and the street furniture, never on a road or a place", () => {
    const kit = createKit();
    const town = buildTown(kit);
    expect(town.props.length).toBeGreaterThan(60);
    expect(kit.buildIn.props).toBe(town.props);
    for (const p of town.props) {
      const { x, z } = p.position;
      if (p.userData.kind === "tree") {
        expect(onRoad(x, z), `tree at ${x},${z}`).toBe(false);
        for (const place of PLACES) {
          expect(Math.hypot(x - place.map.x, z - place.map.z)).toBeGreaterThanOrEqual(
            place.map.r + 0.5,
          );
        }
      }
    }
    const trees = town.props.filter((p) => p.userData.kind === "tree").length;
    expect(trees).toBeGreaterThanOrEqual(55);
    expect(trees).toBeLessThanOrEqual(60);
    expect(town.props.filter((p) => p.userData.kind === "home")).toHaveLength(HOMES.length);
  });

  it("uses the shared blocked-area rule", () => {
    expect(isBlocked(0, 0)).toBe(true);
    expect(isBlocked(PLACES[0].map.x, PLACES[0].map.z)).toBe(true);
  });

  it("drifts cloud shadows that only the shadow camera sees", () => {
    const kit = createKit();
    const town = buildTown(kit);
    const before = town.clouds[0].position.x;
    kit.frame(1, 1, { night: 0, lit: 0, tier: 3 });
    expect(town.clouds[0].position.x).not.toBe(before);
    town.clouds[0].traverse((o) => {
      if ((o as THREE.Mesh).isMesh) expect(o.layers.mask).toBe(1 << 1);
    });
  });

  it("smokes on Medium and High only", () => {
    const kit = createKit();
    const root = new THREE.Group();
    addSmoke(kit, root, [new THREE.Vector3(0, 3, 0)]);
    const visible = () => {
      let n = 0;
      root.traverse((o) => {
        if ((o as THREE.Mesh).isMesh && o.visible) n++;
      });
      return n;
    };
    for (let i = 0; i < 10; i++) kit.frame(0.2, i * 0.2, { night: 0, lit: 0, tier: 1 });
    expect(visible()).toBe(0);
    for (let i = 0; i < 10; i++) kit.frame(0.2, i * 0.2, { night: 0, lit: 0, tier: 3 });
    expect(visible()).toBeGreaterThan(0);
  });
});
