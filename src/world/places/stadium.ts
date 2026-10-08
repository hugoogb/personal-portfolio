import * as THREE from "three";
import type { Kit } from "@/world/kit/kit";

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

interface Player {
  m: THREE.Mesh;
  tx: number;
  tz: number;
}

/** Green-and-white football ground (reference 940-974; players and ball 1483-1486). */
export function buildStadium(kit: Kit): THREE.Group {
  const { rbox, cyl, ball, mk, mat, makeMat, canvasTex, geoBox, textPlane, own, rand } = kit;
  const g = new THREE.Group();
  const stripes = canvasTex(256, 32, (c, w, h) => {
    for (let i = 0; i < 16; i++) {
      c.fillStyle = i % 2 ? "#ffffff" : "#00954c";
      c.fillRect((i * w) / 16, 0, w / 16, h);
    }
  });
  const standMat = (n: number) => {
    const t = own(stripes.clone());
    t.wrapS = THREE.RepeatWrapping;
    t.repeat.set(n, 1);
    t.needsUpdate = true;
    return makeMat("#ffffff", { map: t, rough: 0.8 });
  };
  const pitchTex = canvasTex(512, 330, (c, w, h) => {
    for (let i = 0; i < 10; i++) {
      c.fillStyle = i % 2 ? "#3f9b45" : "#48a84e";
      c.fillRect((i * w) / 10, 0, w / 10, h);
    }
    c.strokeStyle = "rgba(255,255,255,.9)";
    c.lineWidth = 4;
    c.strokeRect(14, 14, w - 28, h - 28);
    c.beginPath();
    c.moveTo(w / 2, 14);
    c.lineTo(w / 2, h - 14);
    c.stroke();
    c.beginPath();
    c.arc(w / 2, h / 2, 46, 0, 7);
    c.stroke();
    c.strokeRect(14, h / 2 - 80, 70, 160);
    c.strokeRect(w - 84, h / 2 - 80, 70, 160);
  });
  rbox(8.2, 0.12, 6.4, "#d9dccf", 0, 0, -0.25, g, 0.3);
  const p = new THREE.Mesh(
    own(new THREE.PlaneGeometry(5, 3.2)),
    makeMat("#48a84e", { map: pitchTex, rough: 0.9 }),
  );
  p.rotation.x = -Math.PI / 2;
  p.position.y = 0.13;
  p.receiveShadow = true;
  g.add(p);
  for (const s of [-1, 1]) {
    cyl(0.025, 0.025, 0.5, "#ffffff", s * 2.55, 0.13, -0.35, g, 6);
    cyl(0.025, 0.025, 0.5, "#ffffff", s * 2.55, 0.13, 0.35, g, 6);
  }
  const stand = (w: number, d: number, h: number, x: number, y: number, z: number, n: number) =>
    mk(geoBox(w, h, d, 0.08), standMat(n), g, x, y + h / 2, z);
  stand(5.8, 0.7, 0.55, 0, 0.12, -2.0, 10);
  stand(5.8, 0.6, 0.55, 0, 0.67, -2.6, 10);
  stand(5.8, 0.5, 0.5, 0, 1.22, -3.1, 10);
  stand(0.7, 3.4, 0.55, -2.95, 0.12, 0, 6);
  stand(0.6, 3.4, 0.55, -3.55, 0.67, 0, 6);
  stand(0.5, 3.4, 0.5, -4.05, 1.22, 0, 6);
  stand(5.8, 0.6, 0.35, 0, 0.12, 1.95, 10);
  stand(0.6, 3.4, 0.35, 2.9, 0.12, 0, 6);
  rbox(6.8, 0.1, 1.3, "#eef1f4", 0, 2.35, -3.0, g, 0.04);
  for (const x of [-2.9, 0, 2.9]) cyl(0.05, 0.05, 1, "#cfd5dc", x, 1.4, -3.5, g, 8);
  const seats: [number, number, number][] = [];
  const row = (x1: number, x2: number, z1: number, z2: number, y: number) => {
    const n = Math.round(Math.hypot(x2 - x1, z2 - z1) / 0.32);
    for (let i = 0; i <= n; i++) seats.push([lerp(x1, x2, i / n), y, lerp(z1, z2, i / n)]);
  };
  row(-2.7, 2.7, -2.0, -2.0, 0.67);
  row(-2.7, 2.7, -2.6, -2.6, 1.22);
  row(-2.7, 2.7, -3.1, -3.1, 1.72);
  row(-2.95, -2.95, -1.5, 1.5, 0.67);
  row(-3.55, -3.55, -1.5, 1.5, 1.22);
  row(-4.05, -4.05, -1.5, 1.5, 1.72);
  row(-2.7, 2.7, 1.95, 1.95, 0.47);
  row(2.9, 2.9, -1.5, 1.5, 0.47);
  const crowd = new THREE.InstancedMesh(
    own(new THREE.CapsuleGeometry(0.065, 0.1, 3, 8)),
    makeMat("#ffffff", { rough: 0.8 }),
    seats.length,
  );
  const cols = ["#00954c", "#ffffff", "#f2c6a0"].map((c) => new THREE.Color(c));
  const m4 = new THREE.Matrix4();
  seats.forEach((s, i) => {
    crowd.setColorAt(i, rand() < 0.45 ? cols[0] : rand() < 0.6 ? cols[1] : cols[2]);
    m4.makeTranslation(s[0], s[1] + 0.12, s[2]);
    crowd.setMatrixAt(i, m4);
  });
  crowd.castShadow = true;
  g.add(crowd);
  const lights: THREE.PointLight[] = [];
  for (const [x, z] of [
    [-3.7, -3.4],
    [3.7, -3.4],
    [-3.7, 2.6],
    [3.7, 2.6],
  ]) {
    cyl(0.07, 0.1, 4.4, "#9aa3ad", x, 0.12, z, g, 10);
    rbox(0.85, 0.42, 0.16, kit.materials.lamp, x, 4.4, z, g, 0.05);
    const L = new THREE.PointLight("#fff1d6", 0, 11, 1.5);
    L.position.set(x * 0.8, 4.2, z * 0.8);
    g.add(L);
    lights.push(L);
    kit.pointLights.push(L);
  }
  rbox(1.7, 0.62, 0.14, "#1f2329", 0, 2.45, -3.35, g, 0.05);
  textPlane(g, "HOME 2 - 1 AWAY", "#1f2329", 1.5, 0.42, 0, 2.76, -3.27, "#ffd166");
  const net = own(
    new THREE.MeshStandardMaterial({
      color: "#ffffff",
      transparent: true,
      opacity: 0.35,
      roughness: 0.6,
    }),
  );
  for (const sx of [-1, 1])
    mk(new THREE.BoxGeometry(0.12, 0.46, 0.72), net, g, sx * 2.62, 0.36, 0, false);
  for (const [x, z] of [
    [-2.48, -1.58],
    [2.48, -1.58],
    [-2.48, 1.58],
    [2.48, 1.58],
  ]) {
    cyl(0.012, 0.012, 0.3, "#ffffff", x, 0.13, z, g, 5);
    const f = new THREE.Mesh(
      own(new THREE.PlaneGeometry(0.12, 0.08)),
      mat("#ffd166", { side: THREE.DoubleSide }),
    );
    f.position.set(x + 0.06, 0.39, z);
    g.add(f);
  }
  const pg = new THREE.CapsuleGeometry(0.055, 0.1, 3, 8);
  const players: Player[] = [];
  for (let i = 0; i < 8; i++) {
    const col = i < 4 ? (i % 2 ? "#ffffff" : "#00954c") : "#3b82c4";
    // 11 cm capsules: their shadows are specks, and each would cost a shadow-pass draw
    const m = mk(pg, col, g, (rand() * 2 - 1) * 2, 0.25, (rand() * 2 - 1) * 1.2, false);
    m.userData.dynamic = true;
    players.push({ m, tx: (rand() * 2 - 1) * 2.2, tz: (rand() * 2 - 1) * 1.35 });
  }
  const pball = ball(0.045, "#ffffff", 0, 0.18, 0, g, 10);
  pball.userData.dynamic = true;
  kit.life.players = players;
  kit.life.pball = pball;
  kit.life.stadium = { crowd, seats, lights, wave: -1 };

  let pT = 0;
  let pTarget = 0;
  kit.onFrame((dt) => {
    for (const q of players) {
      const dx = q.tx - q.m.position.x;
      const dz = q.tz - q.m.position.z;
      const d = Math.hypot(dx, dz);
      if (d < 0.06) {
        q.tx = (Math.random() * 2 - 1) * 2.2;
        q.tz = (Math.random() * 2 - 1) * 1.35;
      } else {
        q.m.position.x += (dx / d) * dt * 0.45;
        q.m.position.z += (dz / d) * dt * 0.45;
      }
    }
    pT += dt;
    if (pT > 1.6) {
      pT = 0;
      pTarget = Math.floor(Math.random() * players.length);
    }
    const tp = players[pTarget].m.position;
    const bp = pball.position;
    bp.x = lerp(bp.x, tp.x + 0.07, Math.min(1, dt * 2.2));
    bp.z = lerp(bp.z, tp.z, Math.min(1, dt * 2.2));
  });
  return g;
}
