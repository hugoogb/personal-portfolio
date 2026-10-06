import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import type { Tier } from "@/boot/tiers";

/** Soft clay, the locked art kit (spec 5.1); the reference sketch's STYLES.clay. */
export const CLAY = {
  round: 1,
  rough: 0.72,
  ground: {
    grass: "#8cc56e",
    sand: "#ead7a6",
    soil: "#7d5a3d",
    road: "#bfc3bd",
    walk: "#e6e2d8",
    plaza: "#efe9dc",
  },
  water: { day: "#4f9fcf", night: "#173049" },
  wall: "#f6f4ef",
} as const;

export interface MatOpts {
  rough?: number;
  metal?: number;
  emissive?: string;
  emissiveIntensity?: number;
  map?: THREE.Texture;
  /** Use the map as the emissive map too (glowing signs). */
  emissiveMap?: boolean;
  side?: THREE.Side;
  transparent?: boolean;
  opacity?: number;
}
export type MatLike = string | THREE.Material;
export interface FrameEnv {
  night: number;
  lit: number;
  tier: Tier;
}
export type FrameFn = (dt: number, t: number, env: FrameEnv) => void;
export type AccentMode = "color" | "emissive" | "both";
export interface RoadPiece {
  walk: THREE.Mesh;
  asph: THREE.Mesh;
  axis: "x" | "z";
}
type Draw = (c: CanvasRenderingContext2D, w: number, h: number) => void;

/** mulberry32, as in the reference (line 550), so layouts are repeatable. */
export const mkRand = (seed: number) => {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/**
 * Everything the town is built from: cached materials and geometry, the
 * shared window/lamp/accent materials, and the registries the systems use
 * (accent paint, signs, point lights, frame hooks, build-in parts).
 */
export function createKit(seed = 1337) {
  const owned = {
    geometries: new Set<THREE.BufferGeometry>(),
    materials: new Set<THREE.Material>(),
    textures: new Set<THREE.Texture>(),
  };
  const own = <T extends THREE.BufferGeometry | THREE.Material | THREE.Texture>(x: T): T => {
    if (x instanceof THREE.BufferGeometry) owned.geometries.add(x);
    else if (x instanceof THREE.Material) owned.materials.add(x);
    else owned.textures.add(x);
    return x;
  };
  const matCache = new Map<string, THREE.Material>();
  const geoCache = new Map<string, THREE.BufferGeometry>();
  const rand = mkRand(seed);
  const frames: FrameFn[] = [];

  const makeMat = (c: string, o: MatOpts = {}) => {
    const params: THREE.MeshStandardMaterialParameters = {
      color: o.map ? "#ffffff" : c,
      side: o.side ?? THREE.FrontSide,
      transparent: !!o.transparent,
      opacity: o.opacity ?? 1,
      roughness: o.rough ?? CLAY.rough,
      metalness: o.metal ?? 0,
    };
    if (o.map) params.map = o.map;
    if (o.emissive) {
      params.emissive = o.emissive;
      params.emissiveIntensity = o.emissiveIntensity ?? 0;
      if (o.emissiveMap && o.map) params.emissiveMap = o.map;
    }
    return own(new THREE.MeshStandardMaterial(params));
  };
  const mat = (c: string, o: MatOpts = {}): THREE.Material => {
    const key = c + JSON.stringify(o, (_k, v) => (v && v.isTexture ? v.uuid : v));
    let m = matCache.get(key);
    if (!m) {
      m = makeMat(c, o);
      matCache.set(key, m);
    }
    return m;
  };
  const M = (m: MatLike) => (typeof m === "string" ? mat(m) : m);

  const geoBox = (w: number, h: number, d: number, r: number): THREE.BufferGeometry => {
    const rr = r * CLAY.round;
    if (rr < 0.012) {
      const key = "b" + [w, h, d].map((v) => v.toFixed(3)).join("|");
      let g = geoCache.get(key);
      if (!g) geoCache.set(key, (g = own(new THREE.BoxGeometry(w, h, d))));
      return g;
    }
    const R2 = Math.max(0.005, Math.min(rr, w / 2 - 0.002, h / 2 - 0.002, d / 2 - 0.002));
    const key = [w, h, d, R2].map((v) => v.toFixed(3)).join("|");
    let g = geoCache.get(key);
    if (!g) geoCache.set(key, (g = own(new RoundedBoxGeometry(w, h, d, 3, R2))));
    return g;
  };

  const mk = (
    geo: THREE.BufferGeometry,
    m: MatLike,
    parent: THREE.Object3D,
    x: number,
    y: number,
    z: number,
    shadow = true,
  ) => {
    own(geo);
    const mesh = new THREE.Mesh(geo, M(m));
    mesh.position.set(x, y, z);
    mesh.castShadow = shadow;
    mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  };
  const rbox = (
    w: number,
    h: number,
    d: number,
    m: MatLike,
    x: number,
    y: number,
    z: number,
    parent: THREE.Object3D,
    r = 0.1,
    shadow = true,
  ) => mk(geoBox(w, h, d, r), m, parent, x, y + h / 2, z, shadow);
  const box = (
    w: number,
    h: number,
    d: number,
    m: MatLike,
    x: number,
    y: number,
    z: number,
    parent: THREE.Object3D,
    shadow = true,
  ) => mk(geoBox(w, h, d, 0), m, parent, x, y + h / 2, z, shadow);
  const cyl = (
    rt: number,
    rb: number,
    h: number,
    m: MatLike,
    x: number,
    y: number,
    z: number,
    parent: THREE.Object3D,
    seg = 16,
  ) => mk(new THREE.CylinderGeometry(rt, rb, h, seg), m, parent, x, y + h / 2, z);
  const ball = (
    r: number,
    m: MatLike,
    x: number,
    y: number,
    z: number,
    parent: THREE.Object3D,
    seg = 16,
  ) => mk(new THREE.SphereGeometry(r, seg, Math.round(seg * 0.75)), m, parent, x, y, z);
  const gable = (
    w: number,
    d: number,
    h: number,
    m: MatLike,
    x: number,
    y: number,
    z: number,
    parent: THREE.Object3D,
    over = 0.16,
  ) => {
    const s = new THREE.Shape();
    const hw = d / 2 + over;
    s.moveTo(-hw, 0);
    s.lineTo(hw, 0);
    s.lineTo(0, h);
    s.closePath();
    const depth = w + over * 2 - 0.12;
    const bev = 0.05;
    const g = new THREE.ExtrudeGeometry(s, {
      depth,
      bevelEnabled: true,
      bevelThickness: bev * 1.2,
      bevelSize: bev,
      bevelSegments: 3,
      curveSegments: 1,
    });
    g.translate(0, 0, -depth / 2);
    g.rotateY(Math.PI / 2);
    return mk(g, m, parent, x, y, z);
  };
  const hip = (
    w: number,
    d: number,
    h: number,
    m: MatLike,
    x: number,
    y: number,
    z: number,
    parent: THREE.Object3D,
  ) => {
    rbox(w + 0.36, 0.12, d + 0.36, m, x, y, z, parent, 0.05);
    const g = new THREE.ConeGeometry(Math.SQRT1_2, 1, 4, 1);
    g.rotateY(Math.PI / 4);
    const mesh = mk(g, m, parent, x, y + 0.12 + h / 2, z);
    mesh.scale.set(w + 0.2, h, d + 0.2);
    return mesh;
  };

  const materials = {
    win: makeMat("#a7bccd", { emissive: "#ffc46b", emissiveIntensity: 0, rough: 0.25 }),
    winDim: makeMat("#a9bfcf", { emissive: "#ffe2a8", emissiveIntensity: 0, rough: 0.25 }),
    winOff: makeMat("#9fb2c2", { rough: 0.25 }),
    lamp: makeMat("#f6f1e4", { emissive: "#ffd590", emissiveIntensity: 0, rough: 0.4 }),
    accentRoof: makeMat("#f97316", { rough: 0.6 }),
    accentFlag: makeMat("#f97316", { rough: 0.6, side: THREE.DoubleSide }),
    leafA: mat("#4f8f45", { rough: 0.85 }),
    leafB: mat("#64a656", { rough: 0.85 }),
    leafC: mat("#79b45f", { rough: 0.85 }),
    pine: mat("#3f7d48", { rough: 0.85 }),
    trunk: mat("#7a5a3c"),
    pool: null as unknown as THREE.MeshBasicMaterial,
  };
  const winMats = [materials.win, materials.win, materials.winDim, materials.winOff];
  const winPick = () => winMats[Math.floor(rand() * winMats.length)];

  const windows = (
    parent: THREE.Object3D,
    w: number,
    d: number,
    h: number,
    floors: number,
    y0 = 0,
    doorX: number | null = null,
  ) => {
    const front: { x: number; y: number; wh: number }[] = [];
    for (let f = 0; f < floors; f++) {
      const fh = h / floors;
      const wh = Math.min(0.44, fh * 0.52);
      const y = y0 + f * fh + fh * 0.3;
      const nx = Math.max(1, Math.floor(w / 0.64));
      for (let k = 0; k < nx; k++) {
        const x = -w / 2 + (k + 0.5) * (w / nx);
        if (f === 0 && doorX !== null && Math.abs(x - doorX) < 0.45) continue;
        rbox(0.36, wh + 0.08, 0.05, "#ffffff", x, y - 0.04, d / 2 + 0.005, parent, 0.02, false);
        rbox(0.28, wh, 0.05, winPick(), x, y, d / 2 + 0.02, parent, 0.02, false);
        rbox(0.44, 0.045, 0.11, "#ffffff", x, y - 0.085, d / 2 + 0.045, parent, 0.015, false);
        front.push({ x, y, wh });
      }
      const nz = Math.max(1, Math.floor(d / 0.64));
      for (let k = 0; k < nz; k++) {
        const z = -d / 2 + (k + 0.5) * (d / nz);
        rbox(0.05, wh + 0.08, 0.36, "#ffffff", w / 2 + 0.005, y - 0.04, z, parent, 0.02, false);
        rbox(0.05, wh, 0.28, winPick(), w / 2 + 0.02, y, z, parent, 0.02, false);
        rbox(0.11, 0.045, 0.44, "#ffffff", w / 2 + 0.045, y - 0.085, z, parent, 0.015, false);
      }
    }
    return front;
  };
  const door = (
    parent: THREE.Object3D,
    x: number,
    z: number,
    face: "z" | "x" = "z",
    c = "#6b4a35",
  ) =>
    face === "z"
      ? rbox(0.42, 0.7, 0.06, c, x, 0, z, parent, 0.03, false)
      : rbox(0.06, 0.7, 0.42, c, x, 0, z, parent, 0.03, false);

  const canvasTex = (w: number, h: number, draw: Draw) => {
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (ctx) draw(ctx, w, h);
    const t = own(new THREE.CanvasTexture(canvas));
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
    t.userData.redraw = () => {
      if (!ctx) return;
      draw(ctx, w, h);
      t.needsUpdate = true;
    };
    return t;
  };

  const poolTex = canvasTex(128, 128, (c, w, h) => {
    const gr = c.createRadialGradient(64, 64, 0, 64, 64, 64);
    gr.addColorStop(0, "rgba(255,255,255,1)");
    gr.addColorStop(0.45, "rgba(255,255,255,.45)");
    gr.addColorStop(1, "rgba(255,255,255,0)");
    c.fillStyle = gr;
    c.fillRect(0, 0, w, h);
  });
  materials.pool = own(
    new THREE.MeshBasicMaterial({
      map: poolTex,
      color: "#fff0d0",
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
  );
  const pool = (parent: THREE.Object3D, x: number, z: number, sx: number, sz: number, y = 0.09) => {
    const m = new THREE.Mesh(own(new THREE.PlaneGeometry(1, 1)), materials.pool);
    m.rotation.x = -Math.PI / 2;
    m.scale.set(sx, sz, 1);
    m.position.set(x, y, z);
    m.renderOrder = 2;
    parent.add(m);
    return m;
  };

  const signMats: THREE.MeshStandardMaterial[] = [];
  const signTextures: THREE.Texture[] = [];
  const textTex = (text: string, bg: string, w: number, h: number, fg = "#ffffff") => {
    const t = canvasTex(512, Math.max(64, Math.round((512 * h) / w)), (c, cw, ch) => {
      c.fillStyle = bg;
      c.fillRect(0, 0, cw, ch);
      let size = Math.round(ch * 0.56);
      c.font = `800 ${size}px "Hanken Grotesk", sans-serif`;
      const mw = c.measureText(text).width;
      if (mw > cw * 0.9) {
        size = Math.floor((size * cw * 0.9) / mw);
        c.font = `800 ${size}px "Hanken Grotesk", sans-serif`;
      }
      c.fillStyle = fg;
      c.textAlign = "center";
      c.textBaseline = "middle";
      c.fillText(text, cw / 2, ch / 2 + 2);
    });
    signTextures.push(t);
    return t;
  };
  const textPlane = (
    parent: THREE.Object3D,
    text: string,
    bg: string,
    w: number,
    h: number,
    x: number,
    y: number,
    z: number,
    fg?: string,
    glow = true,
    ry = 0,
  ) => {
    const m = own(
      new THREE.MeshStandardMaterial({
        map: textTex(text, bg, w, h, fg),
        roughness: 0.6,
        emissive: "#ffffff",
        emissiveIntensity: 0,
      }),
    );
    m.emissiveMap = m.map;
    if (glow) signMats.push(m);
    const pl = new THREE.Mesh(own(new THREE.PlaneGeometry(w, h)), m);
    pl.position.set(x, y, z);
    pl.rotation.y = ry;
    parent.add(pl);
    return pl;
  };
  const plaque = (g: THREE.Object3D, text: string, col: string, x: number, z: number, w = 1.1) => {
    const h = 0.3;
    rbox(w + 0.14, 0.1, 0.26, "#d9d2c4", x, 0, z, g, 0.04);
    rbox(w + 0.06, h + 0.08, 0.08, col, x, 0.1, z, g, 0.03);
    textPlane(g, text, col, w, h, x, 0.14 + h / 2, z + 0.045);
  };
  const bush = (g: THREE.Object3D, x: number, z: number, k = 1) => {
    ball(0.22 * k, materials.leafB, x, 0.17 * k, z, g, 12);
    ball(0.16 * k, materials.leafA, x + 0.16 * k, 0.12 * k, z + 0.09 * k, g, 10);
    ball(0.13 * k, materials.leafB, x - 0.12 * k, 0.1 * k, z + 0.12 * k, g, 10);
  };
  const stripeTex = (a: string, b: string, n = 8, vertical = true) =>
    canvasTex(128, 128, (c, w, h) => {
      for (let i = 0; i < n; i++) {
        c.fillStyle = i % 2 ? b : a;
        if (vertical) c.fillRect((i * w) / n, 0, w / n, h);
        else c.fillRect(0, (i * h) / n, w, h / n);
      }
    });
  const umbrella = (
    g: THREE.Object3D,
    x: number,
    z: number,
    a: string,
    b: string,
    r = 0.42,
    y = 0,
  ) => {
    cyl(0.018, 0.018, 0.95, "#d8d2c6", x, y, z, g, 6);
    mk(
      new THREE.ConeGeometry(r, 0.22, 16, 1, true),
      makeMat("#ffffff", { map: stripeTex(a, b), rough: 0.7, side: THREE.DoubleSide }),
      g,
      x,
      y + 0.98,
      z,
    );
  };
  const table = (g: THREE.Object3D, x: number, z: number, y = 0) => {
    cyl(0.02, 0.03, 0.42, "#4b4f56", x, y, z, g, 8);
    cyl(0.22, 0.22, 0.03, "#f3efe6", x, y + 0.42, z, g, 20);
    for (const [dx, r] of [
      [-0.33, 0],
      [0.33, Math.PI],
    ]) {
      const c = new THREE.Group();
      c.position.set(x + dx, y, z);
      c.rotation.y = r;
      g.add(c);
      rbox(0.18, 0.03, 0.18, "#c98f12", 0, 0.26, 0, c, 0.02);
      rbox(0.03, 0.22, 0.18, "#c98f12", -0.08, 0.29, 0, c, 0.01);
    }
  };
  const crowdRow = (
    list: [number, number, number][],
    x1: number,
    x2: number,
    z: number,
    y: number,
    step = 0.2,
  ) => {
    const n = Math.round(Math.abs(x2 - x1) / step);
    for (let i = 0; i <= n; i++) list.push([lerp(x1, x2, i / n), y, z]);
  };
  const ribbon = (
    curve: THREE.Curve<THREE.Vector3>,
    n: number,
    wid: number,
    y: number,
    m: THREE.Material,
    parent: THREE.Object3D,
  ) => {
    const pos: number[] = [];
    const idx: number[] = [];
    const up = new THREE.Vector3(0, 1, 0);
    const side = new THREE.Vector3();
    for (let i = 0; i <= n; i++) {
      const t = (i / n) % 1;
      const p = curve.getPointAt(t);
      const tg = curve.getTangentAt(t);
      side
        .crossVectors(up, tg)
        .normalize()
        .multiplyScalar(wid / 2);
      pos.push(p.x + side.x, y, p.z + side.z, p.x - side.x, y, p.z - side.z);
      if (i < n) {
        const a = i * 2;
        idx.push(a, a + 2, a + 1, a + 1, a + 2, a + 3);
      }
    }
    const g = own(new THREE.BufferGeometry());
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    g.setIndex(idx);
    g.computeVertexNormals();
    const mesh = new THREE.Mesh(g, m);
    mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  };

  const accent: { material: THREE.MeshStandardMaterial; mode: AccentMode }[] = [
    { material: materials.accentRoof, mode: "color" },
    { material: materials.accentFlag, mode: "color" },
  ];
  const paintAccent = (hex: string) => {
    for (const { material, mode } of accent) {
      if (mode !== "emissive") material.color.set(hex);
      if (mode !== "color") material.emissive.set(hex);
    }
  };

  return {
    rand,
    own,
    mat,
    makeMat,
    mk,
    geoBox,
    rbox,
    box,
    cyl,
    ball,
    gable,
    hip,
    windows,
    door,
    canvasTex,
    textTex,
    textPlane,
    plaque,
    bush,
    stripeTex,
    umbrella,
    table,
    crowdRow,
    pool,
    ribbon,
    winPick,
    materials,
    signMats,
    signTextures,
    accent,
    paintAccent,
    pointLights: [] as THREE.PointLight[],
    /** Named objects later phases drive (arena, stadium seats, ship, hat, LEDs, F1 cars, gift). */
    life: {} as Record<string, unknown>,
    /** What the build-in animates. */
    buildIn: {
      ground: null as THREE.Object3D | null,
      roads: [] as RoadPiece[],
      props: [] as THREE.Object3D[],
    },
    onFrame: (fn: FrameFn) => {
      frames.push(fn);
    },
    frame: (dt: number, t: number, env: FrameEnv) => {
      for (const fn of frames) fn(dt, t, env);
    },
    dispose: () => {
      owned.geometries.forEach((g) => g.dispose());
      owned.materials.forEach((m) => m.dispose());
      owned.textures.forEach((t) => t.dispose());
      owned.geometries.clear();
      owned.materials.clear();
      owned.textures.clear();
      frames.length = 0;
    },
  };
}

export type Kit = ReturnType<typeof createKit>;
