// @vitest-environment jsdom
import * as THREE from "three";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { stubCanvas } from "@/test/canvas";
import { buildWorld } from "@/world/build";
import { freezeStatic } from "@/world/lib/freeze";

vi.setConfig({ testTimeout: 20_000 });

beforeEach(() => {
  stubCanvas();
});

/** On a moving part: the object or one of its ancestors is userData.dynamic. */
const moves = (o: THREE.Object3D | null): boolean =>
  !!o && (o.userData.dynamic === true || moves(o.parent));

describe("freezeStatic", () => {
  it("freezes what is static, with its matrix up to date, and leaves moving parts alone", () => {
    const root = new THREE.Group();
    const wall = new THREE.Mesh();
    wall.position.set(1, 2, 3);
    const car = new THREE.Group();
    car.userData.dynamic = true;
    const wheel = new THREE.Mesh();
    car.add(wheel);
    root.add(wall, car);
    expect(freezeStatic(root)).toBe(2);
    expect(root.matrixAutoUpdate).toBe(false);
    expect(wall.matrixAutoUpdate).toBe(false);
    expect(new THREE.Vector3().setFromMatrixPosition(wall.matrix).toArray()).toEqual([1, 2, 3]);
    expect(car.matrixAutoUpdate).toBe(true);
    expect(wheel.matrixAutoUpdate).toBe(true);
  });

  it("never freezes anything the town animates", () => {
    const w = buildWorld();
    const roots = [w.town.root, ...Object.values(w.places)];
    const all: THREE.Object3D[] = [];
    for (const r of roots) r.traverse((o) => all.push(o));
    const before = all.map((o) => [o.position.clone(), o.quaternion.clone(), o.scale.clone()]);
    // A minute of every motion hook, by day and by night.
    for (let i = 0; i < 3600; i++)
      w.kit.frame(1 / 60, i / 60, { ...w.env, night: i % 1200 < 600 ? 0 : 1, lit: 1 });
    const moved = all.filter((o, i) => {
      const [p, q, s] = before[i] as [THREE.Vector3, THREE.Quaternion, THREE.Vector3];
      return !o.position.equals(p) || !o.quaternion.equals(q) || !o.scale.equals(s);
    });
    expect(moved.length).toBeGreaterThan(0);
    expect(moved.filter((o) => !moves(o)).map((o) => o.name || o.type)).toEqual([]);
    // Moved by the systems rather than by kit frame hooks.
    const life = w.kit.life as Record<string, unknown>;
    const bySystems = [
      life.hat,
      (life.ship as { g: THREE.Object3D }).g,
      ...(life.f1 as { cars: { g: THREE.Object3D }[] }).cars.map((c) => c.g),
      ...(["car", "ball", "flame"] as const).map(
        (k) => (life.arena as Record<string, THREE.Object3D>)[k],
      ),
    ] as THREE.Object3D[];
    expect(bySystems.filter((o) => !moves(o)).map((o) => o.name || o.type)).toEqual([]);
    w.kit.dispose();
  });
});
