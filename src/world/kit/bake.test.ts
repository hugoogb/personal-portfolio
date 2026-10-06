import * as THREE from "three";
import { describe, expect, it } from "vitest";
import { bakeStatic } from "@/world/kit/bake";

const meshes = (o: THREE.Object3D) => {
  let n = 0;
  o.traverse((c) => {
    if ((c as THREE.Mesh).isMesh) n++;
  });
  return n;
};

describe("bakeStatic", () => {
  it("merges static meshes that share a material, keeping their shape", () => {
    const root = new THREE.Group();
    root.position.set(5, 0, 5);
    const red = new THREE.MeshStandardMaterial({ color: "red" });
    const blue = new THREE.MeshStandardMaterial({ color: "blue" });
    const sub = new THREE.Group();
    sub.position.set(1, 0, 0);
    root.add(sub);
    for (const [x, m, parent] of [
      [0, red, root],
      [2, red, root],
      [4, red, sub],
      [6, blue, root],
    ] as const) {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), m);
      mesh.position.x = x;
      parent.add(mesh);
    }
    const before = new THREE.Box3().setFromObject(root);
    const removed = bakeStatic(root);
    expect(removed).toBe(4);
    expect(meshes(root)).toBe(2);
    const after = new THREE.Box3().setFromObject(root);
    expect(after.min.distanceTo(before.min)).toBeLessThan(1e-6);
    expect(after.max.distanceTo(before.max)).toBeLessThan(1e-6);
  });

  it("leaves dynamic subtrees and instanced meshes alone", () => {
    const root = new THREE.Group();
    const m = new THREE.MeshStandardMaterial();
    const moving = new THREE.Group();
    moving.userData.dynamic = true;
    moving.add(
      new THREE.Mesh(new THREE.BoxGeometry(), m),
      new THREE.Mesh(new THREE.BoxGeometry(), m),
    );
    root.add(moving);
    root.add(new THREE.InstancedMesh(new THREE.BoxGeometry(), m, 3));
    root.add(
      new THREE.Mesh(new THREE.BoxGeometry(), m),
      new THREE.Mesh(new THREE.BoxGeometry(), m),
    );
    bakeStatic(root);
    expect(moving.children).toHaveLength(2);
    expect(root.children.filter((c) => (c as THREE.InstancedMesh).isInstancedMesh)).toHaveLength(1);
    expect(meshes(root)).toBe(2 + 1 + 1);
  });

  it("keeps shadow casters and non-casters apart", () => {
    const root = new THREE.Group();
    const m = new THREE.MeshStandardMaterial();
    const a = new THREE.Mesh(new THREE.BoxGeometry(), m);
    const b = new THREE.Mesh(new THREE.BoxGeometry(), m);
    a.castShadow = true;
    b.castShadow = false;
    root.add(a, b);
    bakeStatic(root);
    const casts = root.children.map((c) => (c as THREE.Mesh).castShadow).sort();
    expect(casts).toEqual([false, true]);
  });
});
