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

  it("casts drifting cloud shadows from one invisible instanced mesh on the main layer", () => {
    const kit = createKit();
    const town = buildTown(kit);
    const clouds = town.clouds;
    expect(clouds.isInstancedMesh).toBe(true);
    // three's shadow pass tests the main camera's layers, so layer 0
    expect(clouds.layers.mask).toBe(1);
    expect(clouds.castShadow).toBe(true);
    expect(clouds.receiveShadow).toBe(false);
    expect(clouds.userData.dynamic).toBe(true);
    const mat = clouds.material as THREE.MeshBasicMaterial;
    expect(mat.colorWrite).toBe(false);
    expect(mat.depthWrite).toBe(false);
    const before = clouds.instanceMatrix.array[12];
    kit.frame(1, 1, { night: 0, lit: 0, tier: 3 });
    expect(clouds.instanceMatrix.array[12]).not.toBe(before);
    expect(clouds.visible).toBe(true);
  });

  it("casts cloud shadows by day only, and keeps drifting at night", () => {
    const kit = createKit();
    const clouds = buildTown(kit).clouds;
    const before = clouds.instanceMatrix.array[12];
    kit.frame(1, 1, { night: 1, lit: 1, tier: 3 });
    expect(clouds.visible).toBe(false);
    expect(clouds.instanceMatrix.array[12]).not.toBe(before);
    kit.frame(1, 2, { night: 0, lit: 0, tier: 3 });
    expect(clouds.visible).toBe(true);
  });

  describe("chimney smoke", () => {
    const setup = (ready: () => boolean) => {
      const kit = createKit();
      const root = new THREE.Group();
      addSmoke(kit, root, [new THREE.Vector3(0, 3, 0)], ready);
      const puffs = root.children[0] as THREE.InstancedMesh;
      /** Puffs alive: instances that are not scaled to nothing. */
      const alive = () => {
        let n = 0;
        const m = new THREE.Matrix4();
        const s = new THREE.Vector3();
        for (let i = 0; i < puffs.count; i++) {
          puffs.getMatrixAt(i, m);
          if (m.decompose(new THREE.Vector3(), new THREE.Quaternion(), s) && s.x > 0) n++;
        }
        return puffs.visible ? n : 0;
      };
      const run = (tier: 0 | 1 | 2 | 3) => {
        for (let i = 0; i < 10; i++) kit.frame(0.2, i * 0.2, { night: 0, lit: 0, tier });
      };
      return { run, alive };
    };

    it("smokes on Medium and High only", () => {
      const { run, alive } = setup(() => true);
      run(3);
      expect(alive()).toBeGreaterThan(0);
      run(1);
      expect(alive()).toBe(0);
    });

    it("waits for the town to exist before it smokes", () => {
      let ready = false;
      const { run, alive } = setup(() => ready);
      run(3);
      expect(alive()).toBe(0);
      ready = true;
      run(3);
      expect(alive()).toBeGreaterThan(0);
    });
  });
});
