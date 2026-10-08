// @vitest-environment jsdom
import * as THREE from "three";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { stubCanvas } from "@/test/canvas";
import { CLAY, createKit, mkRand } from "@/world/kit/kit";

beforeEach(() => {
  stubCanvas();
});

describe("mkRand", () => {
  it("is deterministic for a seed", () => {
    const a = mkRand(1337);
    const b = mkRand(1337);
    expect([a(), a(), a()]).toEqual([b(), b(), b()]);
    expect(a()).toBeGreaterThanOrEqual(0);
  });
});

describe("kit geometry", () => {
  it("sits a rounded box on its base", () => {
    const kit = createKit();
    const g = new THREE.Group();
    const m = kit.rbox(2, 1, 1, "#ffffff", 3, 0.5, -1, g, 0.1, false);
    expect(m.parent).toBe(g);
    expect(m.position.toArray()).toEqual([3, 1, -1]);
    expect(m.castShadow).toBe(false);
    expect(m.receiveShadow).toBe(true);
  });

  it("caches geometry and uses a plain box when the radius is tiny", () => {
    const kit = createKit();
    expect(kit.geoBox(1, 1, 1, 0.1)).toBe(kit.geoBox(1, 1, 1, 0.1));
    expect(kit.geoBox(1, 1, 1, 0)).toBeInstanceOf(THREE.BoxGeometry);
  });

  it("caches materials by colour and options", () => {
    const kit = createKit();
    expect(kit.mat("#123456")).toBe(kit.mat("#123456"));
    expect(kit.mat("#123456", { rough: 0.2 })).not.toBe(kit.mat("#123456"));
    expect((kit.mat("#123456") as THREE.MeshStandardMaterial).roughness).toBe(CLAY.rough);
  });

  it("puts lit and unlit windows on both visible faces", () => {
    const kit = createKit();
    const g = new THREE.Group();
    const front = kit.windows(g, 2, 1.5, 2, 2);
    expect(front).toHaveLength(2 * Math.floor(2 / 0.64));
    const winMats = new Set<THREE.Material>([
      kit.materials.win,
      kit.materials.winDim,
      kit.materials.winOff,
    ]);
    const panes = g.children.filter((c) =>
      winMats.has((c as THREE.Mesh).material as THREE.Material),
    );
    expect(panes.length).toBe(2 * (Math.floor(2 / 0.64) + Math.floor(1.5 / 0.64)));
  });

  it("makes a texture even without a 2D context", () => {
    vi.restoreAllMocks();
    const kit = createKit();
    expect(kit.canvasTex(8, 8, () => {})).toBeInstanceOf(THREE.CanvasTexture);
  });
});

describe("kit registries", () => {
  it("paints the accent by mode", () => {
    const kit = createKit();
    const glow = kit.makeMat("#000000", { emissive: "#000000" });
    kit.accent.push({ material: glow, mode: "emissive" });
    kit.paintAccent("#10b981");
    expect(kit.materials.accentRoof.color.getHexString()).toBe("10b981");
    expect(kit.materials.accentFlag.color.getHexString()).toBe("10b981");
    expect(glow.emissive.getHexString()).toBe("10b981");
    expect(glow.color.getHexString()).toBe("000000");
  });

  it("runs frame hooks with the environment", () => {
    const kit = createKit();
    const seen: number[] = [];
    kit.onFrame((dt, t, env) => seen.push(dt, t, env.lit));
    kit.frame(0.1, 2, { night: 1, lit: 0.5, tier: 3 });
    expect(seen).toEqual([0.1, 2, 0.5]);
  });

  it("disposes everything it made", () => {
    const kit = createKit();
    const g = new THREE.Group();
    const m = kit.rbox(1, 1, 1, "#ff0000", 0, 0, 0, g);
    const spy = vi.spyOn(m.material as THREE.Material, "dispose");
    kit.dispose();
    expect(spy).toHaveBeenCalled();
  });
});
