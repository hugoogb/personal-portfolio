import * as THREE from "three";
import type { Kit } from "@/world/kit/kit";

/** ReadLedger, a library with a portico, a bookshelf wall and a manga tower (reference 803-825). */
export function buildLibrary(kit: Kit): THREE.Group {
  const { rbox, box, cyl, mk, gable, plaque, bush, rand, mat } = kit;
  const g = new THREE.Group();
  rbox(3.9, 0.18, 2.9, "#ddd6c8", 0, 0, 0, g, 0.06);
  for (let k = 0; k < 3; k++)
    rbox(2.3, 0.18 - k * 0.06, 0.22, "#e6dfd2", 0, 0, 1.5 + k * 0.2, g, 0.03);
  const hall = new THREE.Group();
  hall.position.z = -0.3;
  g.add(hall);
  rbox(3.4, 2.0, 2.1, "#f2ede3", 0, 0.18, 0, hall, 0.12);
  for (const x of [-1.25, -0.65, 0.65, 1.25]) {
    rbox(0.36, 1.18, 0.05, "#ffffff", x, 0.42, 1.055, hall, 0.03, false);
    rbox(0.28, 1.1, 0.05, kit.winPick(), x, 0.46, 1.07, hall, 0.03, false);
  }
  rbox(0.6, 1.05, 0.06, "#5b3b22", 0, 0.18, 1.06, hall, 0.04, false);
  // the east wall is one big bookshelf
  rbox(0.05, 1.55, 1.85, "#5b3b22", 1.71, 0.38, 0, hall, 0.02, false);
  const SPINE = [
    "#e5484d",
    "#2f9e8f",
    "#ffd166",
    "#3e63dd",
    "#f97316",
    "#7c5cff",
    "#f4f4f2",
    "#1f2329",
    "#ec4899",
    "#10b981",
  ];
  for (const ry of [0.45, 1.2]) {
    box(0.12, 0.04, 1.85, "#7a5a3c", 1.74, ry - 0.04, 0, hall, false);
    let z = -0.85;
    while (z < 0.85) {
      const w = 0.07 + rand() * 0.05,
        h = 0.48 + rand() * 0.18;
      box(0.05, h, w, SPINE[Math.floor(rand() * SPINE.length)], 1.75, ry, z + w / 2, hall, false);
      z += w + 0.012;
    }
  }
  // portico: columns, entablature, pediment and a teal roof
  rbox(3.1, 0.08, 0.55, "#e6dfd2", 0, 0.18, 1.12, g, 0.03);
  for (let i = 0; i < 6; i++) {
    const x = -1.25 + i * 0.5;
    cyl(0.085, 0.1, 1.62, "#f7f3eb", x, 0.26, 1.12, g, 14);
    rbox(0.24, 0.08, 0.24, "#ece6da", x, 1.86, 1.12, g, 0.02);
  }
  rbox(3.2, 0.2, 0.55, "#ece6da", 0, 1.92, 1.12, g, 0.04);
  const roof = gable(2.95, 3.4, 0.8, "#2f9e8f", 0, 2.12, -0.05, g, 0.12);
  roof.rotation.y = Math.PI / 2;
  {
    const s = new THREE.Shape();
    s.moveTo(-1.62, 0);
    s.lineTo(1.62, 0);
    s.lineTo(0, 0.72);
    s.closePath();
    const p = mk(
      new THREE.ShapeGeometry(s),
      mat("#ece6da", { side: THREE.DoubleSide }),
      g,
      0,
      2.13,
      1.4,
      false,
    );
    cyl(0.18, 0.18, 0.04, "#2f9e8f", 0, 0, 0, p, 20).rotation.x = Math.PI / 2;
    p.children[p.children.length - 1].position.set(0, 0.3, 0.02);
  }
  // a tower of manga volumes by the steps
  for (let i = 0; i < 7; i++) {
    const b = rbox(0.5, 0.1, 0.36, SPINE[i % SPINE.length], -2.25, i * 0.1, 1.65, g, 0.02);
    b.rotation.y = i % 2 ? 0.18 : -0.12;
  }
  plaque(g, "READLEDGER", "#2f9e8f", 1.9, 1.95, 0.9);
  bush(g, -1.6, -1.4);
  bush(g, 1.75, -1.2);
  return g;
}
