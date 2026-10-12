// @vitest-environment jsdom
import * as THREE from "three";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { stubCanvas } from "@/test/canvas";
import { bakeStatic } from "@/world/kit/bake";
import { createKit } from "@/world/kit/kit";

beforeEach(() => {
  stubCanvas();
});

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
    const red = new THREE.MeshStandardMaterial({ color: "red", roughness: 0.3 });
    const blue = new THREE.MeshStandardMaterial({ color: "blue", roughness: 0.9 });
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

  describe("colour merging", () => {
    const box = (m: THREE.Material, x: number) => {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), m);
      mesh.position.x = x;
      return mesh;
    };

    it("merges plain materials of different colours into one vertex-coloured mesh", () => {
      const root = new THREE.Group();
      const red = new THREE.MeshStandardMaterial({ color: "#ff0000", roughness: 0.7 });
      const blue = new THREE.MeshStandardMaterial({ color: "#0000ff", roughness: 0.7 });
      root.add(box(red, 0), box(blue, 2));
      const before = new THREE.Box3().setFromObject(root);
      bakeStatic(root, { own: (m) => m });
      expect(meshes(root)).toBe(1);
      const out = root.children[0] as THREE.Mesh;
      const mat = out.material as THREE.MeshStandardMaterial;
      expect(mat.vertexColors).toBe(true);
      const c = out.geometry.getAttribute("color");
      const seen = new Set<string>();
      for (let i = 0; i < c.count; i++) seen.add([c.getX(i), c.getY(i), c.getZ(i)].join(","));
      expect(seen).toEqual(new Set(["1,0,0", "0,0,1"]));
      const after = new THREE.Box3().setFromObject(root);
      expect(after.min.distanceTo(before.min)).toBeLessThan(1e-6);
      expect(after.max.distanceTo(before.max)).toBeLessThan(1e-6);
    });

    it("shares one material across bake calls and registers it with own", () => {
      const owned: THREE.Material[] = [];
      const own = (x: THREE.Material | THREE.BufferGeometry) => {
        if (x instanceof THREE.Material) owned.push(x);
      };
      const make = () => {
        const r = new THREE.Group();
        r.add(
          box(new THREE.MeshStandardMaterial({ color: "#123456" }), 0),
          box(new THREE.MeshStandardMaterial({ color: "#654321" }), 2),
        );
        return r;
      };
      const a = make();
      const b = make();
      bakeStatic(a, { own });
      bakeStatic(b, { own });
      expect((a.children[0] as THREE.Mesh).material).toBe((b.children[0] as THREE.Mesh).material);
      expect(owned).toHaveLength(1);
    });

    it("never colour-merges kept, emissive, mapped or transparent materials", () => {
      const root = new THREE.Group();
      const kept = new THREE.MeshStandardMaterial({ color: "#ff0000" });
      const plain = new THREE.MeshStandardMaterial({ color: "#00ff00" });
      const plain2 = new THREE.MeshStandardMaterial({ color: "#00ee00" });
      const glow = new THREE.MeshStandardMaterial({ color: "#0000ff", emissive: "#ffcc00" });
      const glass = new THREE.MeshStandardMaterial({ color: "#ffffff", transparent: true });
      root.add(box(kept, 0), box(plain, 2), box(plain2, 3), box(glow, 4), box(glass, 5));
      bakeStatic(root, { keep: new Set([kept]), own: (m) => m });
      const mats = root.children.map((c) => (c as THREE.Mesh).material as THREE.Material);
      expect(mats).toContain(kept);
      expect(mats).toContain(glow);
      expect(mats).toContain(glass);
      expect(mats.filter((m) => (m as THREE.MeshStandardMaterial).vertexColors)).toHaveLength(1);
      expect(root.children).toHaveLength(4);
    });
  });

  it("hands merged geometry to its owner, which disposes it", () => {
    const kit = createKit();
    const root = new THREE.Group();
    const m = kit.makeMat("#ff0000");
    for (const x of [0, 2]) {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), m);
      mesh.position.x = x;
      root.add(mesh);
    }
    bakeStatic(root, { own: kit.own });
    const merged = (root.children[0] as THREE.Mesh).geometry;
    const spy = vi.spyOn(merged, "dispose");
    kit.dispose();
    expect(spy).toHaveBeenCalled();
  });

  describe("shadow proxy", () => {
    const scene = () => {
      const root = new THREE.Group();
      const a = new THREE.MeshStandardMaterial({ color: "red", roughness: 0.3 });
      const b = new THREE.MeshStandardMaterial({ color: "blue", roughness: 0.9 });
      const glow = new THREE.MeshStandardMaterial({ color: "white", emissive: "#ffcc00" });
      for (const [x, m] of [
        [0, a],
        [2, b],
        [4, glow],
      ] as const) {
        const mesh = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), m);
        mesh.position.x = x;
        mesh.castShadow = true;
        root.add(mesh);
      }
      return root;
    };

    it("casts every merged caster's shadow from one invisible mesh", () => {
      const root = scene();
      bakeStatic(root, { own: (m) => m, shadowProxy: true });
      const casters = root.children.filter((c) => (c as THREE.Mesh).castShadow) as THREE.Mesh[];
      expect(casters).toHaveLength(1);
      const mat = casters[0].material as THREE.MeshBasicMaterial;
      expect(mat.colorWrite).toBe(false);
      expect(mat.depthWrite).toBe(false);
      expect(casters[0].receiveShadow).toBe(false);
      // all three boxes (24 vertices each) are in it, in root space
      expect(casters[0].geometry.getAttribute("position").count).toBe(72);
      expect(new THREE.Box3().setFromObject(casters[0]).max.x).toBeCloseTo(4.5, 5);
    });

    it("shares one proxy material per owner and is off by default", () => {
      const own = (m: THREE.Material | THREE.BufferGeometry) => m;
      const a = scene();
      const b = scene();
      bakeStatic(a, { own, shadowProxy: true });
      bakeStatic(b, { own, shadowProxy: true });
      const proxy = (r: THREE.Object3D) =>
        (r.children.find((c) => (c as THREE.Mesh).castShadow) as THREE.Mesh).material;
      expect(proxy(a)).toBe(proxy(b));
      const c = scene();
      bakeStatic(c);
      expect(c.children.filter((x) => (x as THREE.Mesh).castShadow).length).toBeGreaterThan(1);
    });
  });
});
