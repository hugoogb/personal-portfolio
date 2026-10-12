import * as THREE from "three";
import type { Kit } from "@/world/kit/kit";

const CUBEC = ["#f97316", "#e5484d", "#2f9e8f", "#7c5cff", "#e0a526", "#3b82c4", "#ec4899"];

interface Cube {
  m: THREE.Mesh;
  plain: THREE.Material;
  face: THREE.Material;
  z: number;
}

/** @avatar-generator, a factory that stamps faces onto cubes (reference 912-939; animation 1463-1464). */
export function buildFactory(kit: Kit): THREE.Group {
  const { rbox, cyl, mk, mat, makeMat, geoBox, door, canvasTex, plaque, bush, winPick } = kit;
  const { win } = kit.materials;
  const g = new THREE.Group();
  rbox(3.3, 0.12, 2.6, "#dfe3e8", 0, 0, 0, g, 0.05);
  rbox(3.0, 1.7, 2.2, "#eceef2", 0, 0.1, 0, g, 0.12);
  for (const x of [-1.1, -0.45]) {
    rbox(0.42, 0.5, 0.05, "#ffffff", x, 0.6, 1.105, g, 0.02, false);
    rbox(0.34, 0.42, 0.05, winPick(), x, 0.64, 1.12, g, 0.02, false);
  }
  for (const z of [-0.6, 0.1]) {
    rbox(0.05, 0.5, 0.42, "#ffffff", 1.505, 0.6, z, g, 0.02, false);
    rbox(0.05, 0.42, 0.34, winPick(), 1.52, 0.64, z, g, 0.02, false);
  }
  door(g, 1.12, 1.12, "z", "#3e63dd");
  rbox(3.1, 0.14, 2.3, "#3e63dd", 0, 1.8, 0, g, 0.05);
  for (const x of [-0.6, 0.4]) rbox(0.7, 0.06, 1.4, win, x, 1.94, -0.1, g, 0.03, false);
  for (const [x, z] of [
    [1.15, -0.75],
    [1.15, 0.55],
  ]) {
    cyl(0.14, 0.16, 0.3, "#c9cfd6", x, 1.94, z, g, 14);
    cyl(0.18, 0.18, 0.05, "#6b7480", x, 2.24, z, g, 14);
  }
  cyl(0.2, 0.26, 3.1, "#97a2ae", -1.15, 0, -0.75, g);
  cyl(0.24, 0.24, 0.12, "#e5484d", -1.15, 2.7, -0.75, g);
  const faceTex = (col: string) =>
    canvasTex(128, 128, (c, w, h) => {
      c.fillStyle = col;
      c.fillRect(0, 0, w, h);
      c.fillStyle = "#1b1d22";
      c.beginPath();
      c.arc(44, 52, 10, 0, 7);
      c.arc(84, 52, 10, 0, 7);
      c.fill();
      c.strokeStyle = "#1b1d22";
      c.lineWidth = 8;
      c.beginPath();
      c.arc(64, 70, 26, 0.15 * Math.PI, 0.85 * Math.PI);
      c.stroke();
    });
  // the face logo on the east wall
  {
    const lg = new THREE.Mesh(
      kit.own(new THREE.CircleGeometry(0.36, 32)),
      makeMat("#ffffff", { map: faceTex("#ffd166") }),
    );
    lg.rotation.y = Math.PI / 2;
    lg.position.set(1.54, 1.18, 0.78);
    g.add(lg);
    const rim = new THREE.Mesh(
      kit.own(new THREE.TorusGeometry(0.37, 0.035, 8, 32)),
      mat("#3e63dd"),
    );
    rim.rotation.y = Math.PI / 2;
    rim.position.set(1.54, 1.18, 0.78);
    g.add(rim);
  }
  // the line comes out of the front wall: belt, a stamping press, a crate of finished faces
  rbox(0.5, 0.5, 0.05, "#2a2f37", 0.45, 0.12, 1.11, g, 0.02, false);
  rbox(0.42, 0.14, 1.8, "#3a414b", 0.45, 0.15, 2.0, g, 0.05);
  for (let i = 0; i < 5; i++) cyl(0.03, 0.03, 0.15, "#5b6470", 0.45, 0, 1.25 + i * 0.4, g, 6);
  for (const x of [0.12, 0.78]) rbox(0.08, 0.95, 0.08, "#606a75", x, 0.12, 1.95, g, 0.02);
  rbox(0.78, 0.12, 0.12, "#606a75", 0.45, 1.05, 1.95, g, 0.03);
  const press = rbox(0.4, 0.2, 0.34, "#e5484d", 0.45, 0.62, 1.95, g, 0.04);
  press.userData.dynamic = true;
  cyl(0.04, 0.04, 0.28, "#9aa3ad", 0.45, 0.8, 1.95, g, 8);
  rbox(0.5, 0.24, 0.42, "#9a6b45", 0.45, 0, 3.08, g, 0.03);
  for (const [dx, dz, ci] of [
    [-0.1, -0.08, 0],
    [0.1, 0.08, 3],
    [0, 0, 5],
  ])
    rbox(
      0.16,
      0.16,
      0.16,
      makeMat("#ffffff", { map: faceTex(CUBEC[ci]) }),
      0.45 + dx,
      0.22,
      3.08 + dz,
      g,
      0.04,
    );
  plaque(g, "@AVATAR-GENERATOR", "#3e63dd", -0.75, 1.75, 1.1);
  bush(g, -1.75, -1.25);
  const cubes: Cube[] = [];
  for (let i = 0; i < 5; i++) {
    const col = CUBEC[i % CUBEC.length];
    const plain = mat(col),
      face = makeMat("#ffffff", { map: faceTex(col) });
    const m = mk(geoBox(0.22, 0.22, 0.22, 0.06), plain, g, 0, 0, 0);
    m.userData.dynamic = true;
    cubes.push({ m, plain, face, z: 1.2 + i * 0.33 });
  }
  const fac = { press, pressY: 0.62, cubes, start: 1.2, end: 2.85, pressZ: 1.95, x: 0.45 };
  kit.life.fac = fac;
  kit.onFrame((dt, t) => {
    fac.press.position.y = fac.pressY - 0.2 * Math.pow(Math.max(0, Math.sin(t * 3.1)), 8);
    for (const c of fac.cubes) {
      c.z += dt * 0.42;
      if (c.z > fac.end) {
        c.z = fac.start;
        c.m.material = c.plain;
      }
      if (c.z > fac.pressZ + 0.05 && c.m.material !== c.face) c.m.material = c.face;
      c.m.position.set(fac.x, 0.4, c.z);
    }
  });
  // chimney top, place-local (reference world position minus the place's x, z), for the smoke
  const chimneys = (kit.life.chimneys ??= []) as { id: string; local: THREE.Vector3 }[];
  chimneys.push({ id: "av", local: new THREE.Vector3(-1.15, 3.25, -0.75) });
  return g;
}
