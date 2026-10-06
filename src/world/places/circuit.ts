import * as THREE from "three";
import type { Kit } from "@/world/kit/kit";

/** Barcelona-Catalunya outline in (u, v), the reference's TRACK (line 682). */
const TRACK: [number, number][] = [
  [-0.85, 0],
  [0.55, 0],
  [0.72, 0.05],
  [0.78, 0.18],
  [0.7, 0.28],
  [0.75, 0.42],
  [0.95, 0.55],
  [1.0, 0.72],
  [0.9, 0.85],
  [0.72, 0.82],
  [0.62, 0.68],
  [0.5, 0.62],
  [0.38, 0.7],
  [0.3, 0.85],
  [0.15, 0.9],
  [-0.2, 0.9],
  [-0.55, 0.88],
  [-0.75, 0.8],
  [-0.8, 0.68],
  [-0.65, 0.6],
  [-0.5, 0.52],
  [-0.6, 0.42],
  [-0.85, 0.38],
  [-1.0, 0.28],
  [-1.0, 0.12],
  [-0.95, 0.03],
];

interface F1Car {
  g: THREE.Group;
  body: THREE.Mesh;
  mat: THREE.Material;
  t: number;
  sp: number;
}

/** F1 Tracker, a pit lane and a Barcelona-shaped circuit with three cars lapping (reference 826-862; laps 1444). */
export function buildCircuit(kit: Kit): THREE.Group {
  const { rbox, box, cyl, ball, mk, mat, canvasTex, textPlane, plaque, crowdRow, pool, ribbon } =
    kit;
  const { lamp, win } = kit.materials;
  const g = new THREE.Group();
  const UX = 4.7,
    VZ = 6.5,
    SZ = 0.45 * VZ;
  const curve = new THREE.CatmullRomCurve3(
    TRACK.map(([u, v]) => new THREE.Vector3(u * UX, 0, (0.45 - v) * VZ)),
    true,
    "centripetal",
  );
  ribbon(curve, 260, 0.62, 0.03, mat("#cdd3c4", { side: THREE.DoubleSide }), g);
  ribbon(curve, 260, 0.36, 0.04, mat("#ffffff", { side: THREE.DoubleSide }), g);
  ribbon(curve, 260, 0.32, 0.05, mat("#4b5059", { side: THREE.DoubleSide, rough: 0.85 }), g);
  // start / finish
  const ck = canvasTex(32, 128, (c, w, h) => {
    for (let yy = 0; yy < 8; yy++)
      for (let xx = 0; xx < 2; xx++) {
        c.fillStyle = (xx + yy) % 2 ? "#111111" : "#ffffff";
        c.fillRect((xx * w) / 2, (yy * h) / 8, w / 2, h / 8);
      }
  });
  const cl = new THREE.Mesh(
    kit.own(new THREE.PlaneGeometry(0.12, 0.32)),
    kit.own(new THREE.MeshStandardMaterial({ map: ck, roughness: 0.8 })),
  );
  cl.rotation.x = -Math.PI / 2;
  cl.position.set(1.0, 0.055, SZ);
  g.add(cl);
  // pit lane, pit wall, garages, paddock roof, control tower
  box(4.9, 0.02, 0.24, "#8c939c", -0.4, 0.03, SZ - 0.4, g, false);
  rbox(4.7, 0.12, 0.05, "#f2f3f5", -0.4, 0.03, SZ - 0.2, g, 0.02);
  box(4.7, 0.03, 0.055, "#e5484d", -0.4, 0.15, SZ - 0.2, g, false);
  const TEAMS = ["#e5484d", "#ff8000", "#00a19b", "#1e41ff", "#2b2d42", "#00d2be", "#f2f2f2"];
  const GZ = SZ - 0.87;
  for (let i = 0; i < 7; i++) {
    const x = -2.4 + i * 0.66;
    rbox(0.62, 0.48, 0.55, "#eef0f3", x, 0, GZ, g, 0.05);
    rbox(0.48, 0.34, 0.04, TEAMS[i], x, 0, GZ + 0.28, g, 0.02, false);
  }
  rbox(4.75, 0.1, 0.7, "#d8dde3", -0.4, 0.48, GZ, g, 0.04);
  rbox(4.6, 0.12, 0.05, win, -0.4, 0.56, GZ + 0.35, g, 0.02, false);
  rbox(0.55, 1.1, 0.55, "#eef0f3", 2.55, 0, GZ, g, 0.06);
  rbox(0.66, 0.28, 0.66, win, 2.55, 1.1, GZ, g, 0.05);
  rbox(0.74, 0.08, 0.74, "#d8dde3", 2.55, 1.38, GZ, g, 0.03);
  // main grandstand on the outside of the straight, facing the track
  const TZ = SZ + 0.55;
  for (let k = 0; k < 3; k++)
    rbox(3.6, 0.13, 0.3, "#cfd5dc", -0.3, k * 0.13, TZ + k * 0.28, g, 0.03);
  rbox(3.8, 0.05, 1.05, "#eef1f4", -0.3, 0.74, TZ + 0.28, g, 0.02);
  for (const x of [-2.1, -0.3, 1.5]) cyl(0.03, 0.03, 0.74, "#9aa3ad", x, 0, TZ + 0.78, g, 6);
  textPlane(
    g,
    "CIRCUIT DE BARCELONA-CATALUNYA",
    "#1f2329",
    3.4,
    0.18,
    -0.3,
    0.64,
    TZ + 0.82,
    "#ffffff",
  );
  {
    const seats: [number, number, number][] = [];
    for (let k = 0; k < 3; k++) crowdRow(seats, -1.95, 1.35, TZ + k * 0.28, k * 0.13 + 0.23, 0.17);
    const cols = ["#e5484d", "#ffd166", "#3b82c4", "#ffffff", "#ff8000", "#00a19b"].map(
      (c) => new THREE.Color(c),
    );
    const cm = new THREE.InstancedMesh(
      kit.own(new THREE.CapsuleGeometry(0.05, 0.07, 3, 8)),
      kit.own(new THREE.MeshStandardMaterial({ roughness: 0.8 })),
      seats.length,
    );
    const m4 = new THREE.Matrix4();
    seats.forEach((s, i) => {
      m4.makeTranslation(s[0], s[1], s[2]);
      cm.setMatrixAt(i, m4);
      cm.setColorAt(i, cols[Math.floor(kit.rand() * cols.length)]);
    });
    cm.castShadow = true;
    g.add(cm);
  }
  // tyre walls at the big braking zones
  {
    const tg = new THREE.TorusGeometry(0.1, 0.045, 8, 16);
    tg.rotateX(Math.PI / 2);
    for (const [x, z] of [
      [5.2, -1.75],
      [4.1, SZ - 0.15],
      [-5.15, 1.2],
      [-3.55, -3.1],
    ])
      for (let k = 0; k < 3; k++) mk(tg, k % 2 ? "#2a2d33" : "#1c1e22", g, x, 0.05 + k * 0.09, z);
  }
  // night race lighting: floodlight masts round the track, a light strip under the grandstand roof
  const MASTS: [number, number][] = [
    [-5.35, 0.2],
    [-5.0, -2.6],
    [-1.5, -3.45],
    [2.2, -3.35],
    [5.4, -0.5],
    [3.9, 3.15],
  ];
  for (const [x, z] of MASTS) {
    cyl(0.045, 0.06, 2.3, "#c3cad2", x, 0, z, g, 8);
    const hd = rbox(0.42, 0.2, 0.1, lamp, x, 2.3, z, g, 0.03);
    hd.rotation.y = Math.atan2(x, z);
  }
  for (const [x, z] of MASTS) pool(g, x * 0.82, z * 0.82, 3.2, 3.2);
  box(3.5, 0.03, 0.05, lamp, -0.3, 0.72, TZ - 0.2, g, false);
  plaque(g, "F1 TRACKER", "#e5484d", -3.65, TZ + 0.45, 1.0);
  // three cars lapping
  const cars: F1Car[] = (
    [
      ["#e5484d", 0.088],
      ["#ff8000", 0.082],
      ["#00a19b", 0.077],
    ] as [string, number][]
  ).map(([col, sp], i) => {
    const c = new THREE.Group();
    c.userData.egg = "lap";
    c.userData.dynamic = true;
    g.add(c);
    const bodyG = kit.own(new THREE.CapsuleGeometry(0.065, 0.3, 4, 10));
    bodyG.rotateZ(Math.PI / 2);
    const m = mat(col);
    const body = new THREE.Mesh(bodyG, m);
    body.position.y = 0.08;
    body.castShadow = true;
    c.add(body);
    rbox(0.08, 0.03, 0.28, col, 0.2, 0.02, 0, c, 0.01);
    rbox(0.06, 0.07, 0.24, "#1f2329", -0.17, 0.07, 0, c, 0.02);
    ball(0.045, "#1f2329", 0, 0.15, 0, c, 8);
    for (const [wx, wz] of [
      [0.12, 0.1],
      [0.12, -0.1],
      [-0.12, 0.1],
      [-0.12, -0.1],
    ]) {
      const wg = new THREE.CylinderGeometry(0.045, 0.045, 0.04, 10);
      wg.rotateX(Math.PI / 2);
      mk(wg, "#16181c", c, wx, 0.045, wz);
    }
    return { g: c, body, mat: m, t: i / 3, sp };
  });
  kit.life.f1 = { curve, cars };
  const p = new THREE.Vector3();
  const tg = new THREE.Vector3();
  kit.onFrame((dt) => {
    for (const c of cars) {
      c.t = (c.t + dt * c.sp) % 1;
      curve.getPointAt(c.t, p);
      curve.getTangentAt(c.t, tg);
      c.g.position.set(p.x, 0.06, p.z);
      c.g.rotation.y = Math.atan2(-tg.z, tg.x);
    }
  });
  return g;
}
