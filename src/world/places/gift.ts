import * as THREE from "three";
import type { Kit } from "@/world/kit/kit";

/** Wrapped Things, a giant gift mid-unwrap with a scaffold and a crane (reference 888-911; animation 1442, 1466). */
export function buildGift(kit: Kit): THREE.Group {
  const { rbox, box, cyl, ball, mk, plaque, makeMat, own } = kit;
  const g = new THREE.Group();
  rbox(2.9, 0.1, 2.9, "#e7e2f6", 0, 0, 0, g, 0.05);
  const W2 = 2.0,
    H2 = 1.5,
    T2 = 0.09,
    OUT = "#7c5cff",
    IN = "#d9cfff",
    RIB = "#ffd23f";
  rbox(W2, 0.12, W2, OUT, 0, 0.1, 0, g, 0.04);
  for (const s of [-1, 1]) {
    rbox(W2, H2, T2, OUT, 0, 0.1, s * (W2 / 2 - T2 / 2), g, 0.03);
    rbox(T2, H2, W2 - T2 * 2, OUT, s * (W2 / 2 - T2 / 2), 0.1, 0, g, 0.03);
    rbox(W2 - T2 * 2, H2 - 0.12, 0.02, IN, 0, 0.22, s * (W2 / 2 - T2 - 0.01), g, 0.01, false);
    rbox(
      0.02,
      H2 - 0.12,
      W2 - T2 * 2 - 0.04,
      IN,
      s * (W2 / 2 - T2 - 0.01),
      0.22,
      0,
      g,
      0.01,
      false,
    );
    rbox(0.32, H2 + 0.02, 0.02, RIB, 0, 0.09, s * (W2 / 2 + 0.012), g, 0.01, false);
    rbox(0.02, H2 + 0.02, 0.32, RIB, s * (W2 / 2 + 0.012), 0.09, 0, g, 0.01, false);
  }
  {
    const glow = own(
      new THREE.MeshStandardMaterial({
        color: "#fff3c4",
        emissive: "#ffd98a",
        emissiveIntensity: 0.9,
      }),
    );
    mk(
      new THREE.BoxGeometry(W2 - T2 * 2 - 0.06, 0.02, W2 - T2 * 2 - 0.06),
      glow,
      g,
      0,
      1.0,
      0,
      false,
    );
  }
  for (const [x, z, c] of [
    [-0.35, -0.2, "#ffc6d9"],
    [0.25, 0.3, "#ffffff"],
    [0.4, -0.4, "#ffe7a3"],
    [-0.2, 0.45, "#ffffff"],
  ] as [number, number, string][]) {
    const t = ball(0.28, c, x, 1.35, z, g, 12);
    t.scale.set(1, 0.55, 1);
  }
  const hinge = new THREE.Group();
  hinge.position.set(0, 1.62, -W2 / 2 - 0.09);
  hinge.userData.dynamic = true;
  g.add(hinge);
  const lid = new THREE.Group();
  lid.position.set(0, 0.18, W2 / 2 + 0.09);
  hinge.add(lid);
  rbox(W2 + 0.18, 0.36, W2 + 0.18, "#9179ff", 0, -0.18, 0, lid, 0.06);
  rbox(W2 + 0.22, 0.37, 0.34, "#ffd23f", 0, -0.185, 0, lid, 0.03);
  rbox(0.34, 0.37, W2 + 0.22, "#ffd23f", 0, -0.185, 0, lid, 0.03);
  {
    const tg = new THREE.TorusGeometry(0.26, 0.08, 10, 24);
    for (const s of [-1, 1]) {
      const loop = mk(tg, "#ffd23f", lid, s * 0.28, 0.36, 0);
      loop.rotation.y = Math.PI / 2 + s * 0.35;
      loop.scale.set(1, 1, 0.7);
    }
    ball(0.13, "#f2b134", 0, 0.22, 0, lid, 12);
  }
  // a flap of paper peeling off the east side
  {
    const pv = new THREE.Group();
    pv.position.set(W2 / 2 + 0.02, 0.1, 0.6);
    pv.rotation.z = -0.55;
    g.add(pv);
    const fl = new THREE.Mesh(
      own(new THREE.PlaneGeometry(0.7, 1.0)),
      makeMat("#a996ff", { side: THREE.DoubleSide }),
    );
    fl.rotation.y = Math.PI / 2;
    fl.position.y = 0.5;
    fl.castShadow = true;
    pv.add(fl);
  }
  // scaffold on the west side, a crane, cones, a plaque
  for (const z of [-1, -0.5, 0, 0.5, 1]) cyl(0.03, 0.03, 2.1, "#7c8796", -1.28, 0.1, z, g, 6);
  for (const y of [0.8, 1.5]) box(0.05, 0.05, 2.1, "#7c8796", -1.28, y, 0, g);
  box(0.32, 0.04, 2.1, "#c49a6c", -1.2, 0.78, 0, g);
  box(0.32, 0.04, 2.1, "#c49a6c", -1.2, 1.48, 0, g);
  rbox(0.24, 4.6, 0.24, "#f2b134", 1.25, 0, -1.35, g, 0.04);
  rbox(4.0, 0.18, 0.18, "#f2b134", 0.35, 4.4, -1.35, g, 0.04);
  rbox(0.55, 0.42, 0.42, "#606a75", 1.95, 4.12, -1.35, g, 0.06);
  for (const [x, z] of [
    [0.1, 1.75],
    [0.42, 1.88],
    [-0.22, 1.9],
  ]) {
    mk(new THREE.ConeGeometry(0.1, 0.3, 14), "#ff7a1a", g, x, 0.25, z);
    cyl(0.07, 0.08, 0.04, "#ffffff", x, 0.22, z, g, 14);
    rbox(0.24, 0.03, 0.24, "#ff7a1a", x, 0.1, z, g, 0.01);
  }
  plaque(g, "WRAPPED · SOON", "#7c5cff", -1.0, 1.85, 1.0);
  kit.life.gift = { hinge };
  const hook = new THREE.Group();
  hook.position.set(-0.6, 4.4, -1.35);
  hook.userData.dynamic = true;
  g.add(hook);
  box(0.02, 1.4, 0.02, "#333333", 0, -1.4, 0, hook, false);
  rbox(0.36, 0.26, 0.36, "#ffd23f", 0, -1.65, 0, hook, 0.05);
  kit.onFrame((_dt, t) => {
    hook.position.x = -0.6 + Math.sin(t * 0.5) * 0.7;
    hinge.rotation.x = -0.22 - (Math.sin(t * 1.1) * 0.5 + 0.5) * 0.26;
  });
  return g;
}
