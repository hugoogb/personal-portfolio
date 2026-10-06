import * as THREE from "three";
import type { Kit } from "@/world/kit/kit";

const AX = 2.3,
  AZ = 1.6;

/** Rocket League arena with egg-shaped fans (reference 975-1006; pad glow 1480). */
export function buildArena(kit: Kit): THREE.Group {
  const { rbox, cyl, ball, mk, mat, makeMat, canvasTex, crowdRow, pool, own, rand } = kit;
  const g = new THREE.Group();
  const arenaTex = canvasTex(512, 360, (c, w, h) => {
    c.fillStyle = "#26324a";
    c.fillRect(0, 0, w, h);
    c.fillStyle = "rgba(255,140,40,.22)";
    c.fillRect(0, 0, w / 2, h);
    c.fillStyle = "rgba(60,140,255,.25)";
    c.fillRect(w / 2, 0, w / 2, h);
    c.strokeStyle = "rgba(255,255,255,.12)";
    c.lineWidth = 1;
    for (let x = 0; x < w; x += 24) {
      for (let y = 0; y < h; y += 21) {
        c.beginPath();
        for (let k = 0; k < 6; k++) {
          const a = (Math.PI / 3) * k;
          c.lineTo(x + ((y / 21) % 2 ? 12 : 0) + 10 * Math.cos(a), y + 10 * Math.sin(a));
        }
        c.closePath();
        c.stroke();
      }
    }
    c.strokeStyle = "#ffffff";
    c.lineWidth = 4;
    c.strokeRect(6, 6, w - 12, h - 12);
    c.beginPath();
    c.moveTo(w / 2, 6);
    c.lineTo(w / 2, h - 6);
    c.stroke();
    c.beginPath();
    c.arc(w / 2, h / 2, 50, 0, 7);
    c.stroke();
  });
  rbox(AX * 2 + 1.6, 0.12, AZ * 2 + 2.8, "#2b3446", 0, 0, 0, g, 0.3);
  const f = new THREE.Mesh(
    own(new THREE.PlaneGeometry(AX * 2, AZ * 2)),
    makeMat("#26324a", { map: arenaTex, rough: 0.55 }),
  );
  f.rotation.x = -Math.PI / 2;
  f.position.y = 0.13;
  f.receiveShadow = true;
  g.add(f);
  const glass = makeMat("#a9d2ff", { transparent: true, opacity: 0.26, rough: 0.05 });
  rbox(AX * 2, 0.5, 0.06, glass, 0, 0.12, -AZ, g, 0.02, false);
  rbox(AX * 2, 0.5, 0.06, glass, 0, 0.12, AZ, g, 0.02, false);
  for (const s of [-1, 1]) {
    rbox(0.06, 0.5, AZ - 0.6, glass, s * AX, 0.12, -(AZ + 0.6) / 2, g, 0.02, false);
    rbox(0.06, 0.5, AZ - 0.6, glass, s * AX, 0.12, (AZ + 0.6) / 2, g, 0.02, false);
    const col = s < 0 ? "#ff8a2a" : "#3c8cff";
    const gx = s * (AX + 0.3);
    cyl(0.04, 0.04, 0.7, col, gx - s * 0.3, 0.12, -0.62, g, 8);
    cyl(0.04, 0.04, 0.7, col, gx - s * 0.3, 0.12, 0.62, g, 8);
    rbox(0.08, 0.08, 1.32, col, gx - s * 0.3, 0.8, 0, g, 0.03);
    rbox(
      0.6,
      0.05,
      1.3,
      makeMat(col, { transparent: true, opacity: 0.45 }),
      gx,
      0.82,
      0,
      g,
      0.02,
      false,
    );
    rbox(
      0.04,
      0.7,
      1.3,
      makeMat(col, { transparent: true, opacity: 0.35 }),
      gx + s * 0.27,
      0.12,
      0,
      g,
      0.01,
      false,
    );
  }
  // stands: two tiers behind the far wall, one tier in front
  rbox(AX * 2 + 0.2, 0.3, 0.45, "#3a4458", 0, 0.12, -(AZ + 0.42), g, 0.05);
  rbox(AX * 2 + 0.2, 0.3, 0.42, "#3a4458", 0, 0.42, -(AZ + 0.84), g, 0.05);
  rbox(AX * 2 + 0.2, 0.24, 0.42, "#3a4458", 0, 0.12, AZ + 0.42, g, 0.05);
  const seats: [number, number, number][] = [];
  crowdRow(seats, -AX + 0.12, AX - 0.12, -(AZ + 0.42), 0.42 + 0.1, 0.19);
  crowdRow(seats, -AX + 0.12, AX - 0.12, -(AZ + 0.84), 0.72 + 0.1, 0.19);
  crowdRow(seats, -AX + 0.12, AX - 0.12, AZ + 0.42, 0.36 + 0.1, 0.19);
  const eggCols = [
    "#ff8a2a",
    "#3c8cff",
    "#ffd23f",
    "#9b5de5",
    "#2ec4b6",
    "#ff4d6d",
    "#ffffff",
    "#8ac926",
  ].map((c) => new THREE.Color(c));
  const eggs = new THREE.InstancedMesh(
    own(new THREE.SphereGeometry(0.075, 12, 10)),
    own(new THREE.MeshStandardMaterial({ roughness: 0.45 })),
    seats.length,
  );
  const m4 = new THREE.Matrix4();
  const sc = new THREE.Vector3(1, 1.35, 1);
  const q = new THREE.Quaternion();
  const pp = new THREE.Vector3();
  seats.forEach((s, i) => {
    pp.set(s[0], s[1], s[2]);
    m4.compose(pp, q, sc);
    eggs.setMatrixAt(i, m4);
    eggs.setColorAt(i, eggCols[Math.floor(rand() * eggCols.length)]);
  });
  eggs.castShadow = true;
  g.add(eggs);
  kit.life.fans = { eggs, seats, cheer: 0 };
  const pm = own(
    new THREE.MeshStandardMaterial({
      color: "#ffd23f",
      emissive: "#ffb000",
      emissiveIntensity: 0.8,
      roughness: 0.4,
    }),
  );
  kit.life.pads = pm;
  for (const [x, z] of [
    [-1.7, -1.15],
    [1.7, -1.15],
    [-1.7, 1.15],
    [1.7, 1.15],
    [0, -1.3],
    [0, 1.3],
  ])
    mk(new THREE.CylinderGeometry(0.13, 0.13, 0.025, 18), pm, g, x, 0.14, z, false);
  const b = ball(0.3, "#eef1f4", 0, 0.43, 0, g, 20);
  b.userData.dynamic = true;
  const car = new THREE.Group();
  car.userData.dynamic = true;
  g.add(car);
  car.position.y = 0.12;
  rbox(0.74, 0.2, 0.42, "#2d6cdf", 0, 0.08, 0, car, 0.08);
  rbox(0.36, 0.17, 0.34, "#1b2740", -0.06, 0.26, 0, car, 0.07);
  rbox(0.1, 0.1, 0.44, "#ff8a2a", -0.34, 0.3, 0, car, 0.03);
  for (const [x, z] of [
    [0.24, 0.21],
    [0.24, -0.21],
    [-0.24, 0.21],
    [-0.24, -0.21],
  ]) {
    const wg = own(new THREE.CylinderGeometry(0.11, 0.11, 0.09, 14));
    wg.rotateX(Math.PI / 2);
    const wh = new THREE.Mesh(wg, mat("#16181c"));
    wh.position.set(x, 0.11, z);
    wh.castShadow = true;
    car.add(wh);
  }
  const flame = new THREE.Mesh(
    own(new THREE.ConeGeometry(0.08, 0.4, 10)),
    own(
      new THREE.MeshStandardMaterial({
        color: "#ffb347",
        emissive: "#ff7a1a",
        emissiveIntensity: 2,
      }),
    ),
  );
  flame.rotation.z = Math.PI / 2;
  flame.position.set(-0.55, 0.15, 0);
  flame.visible = false;
  flame.userData.dynamic = true;
  car.add(flame);
  const lights: THREE.Object3D[] = [];
  for (const [x, z] of [
    [-2.85, -2.45],
    [2.85, -2.45],
    [-2.85, 2.45],
    [2.85, 2.45],
  ]) {
    cyl(0.06, 0.08, 2.7, "#c3cad2", x, 0.12, z, g, 10);
    const hd = rbox(0.5, 0.26, 0.12, kit.materials.lamp, x, 2.8, z, g, 0.04);
    hd.rotation.y = Math.atan2(x, z);
  }
  pool(g, 0, 0, AX * 2 + 1.4, AZ * 2 + 1.6, 0.16);
  kit.life.arena = {
    g,
    ball: b,
    car,
    flame,
    lights,
    bv: new THREE.Vector2(),
    cp: new THREE.Vector2(-1.3, 0),
    th: 0,
    v: 0,
    score: 0,
    lock: 0,
  };
  kit.onFrame((_dt, t) => {
    pm.emissiveIntensity = 0.7 + Math.sin(t * 3) * 0.45;
  });
  return g;
}
