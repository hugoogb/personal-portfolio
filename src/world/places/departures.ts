import * as THREE from "three";
import type { Kit } from "@/world/kit/kit";

const OX = 15.8,
  OZ = 10.8;

/**
 * Departures board and the harbour (reference 1040-1055, straw hat 1082-1088).
 * The harbour and the hat are placed in world space in the reference, so they
 * live in a child group that undoes the board's rotation and offset.
 */
export function buildDepartures(kit: Kit): THREE.Group {
  const { rbox, cyl, ball, mk, mat, canvasTex, own } = kit;
  const g = new THREE.Group();
  g.rotation.y = Math.PI / 4;
  const boardTex = canvasTex(512, 256, (c, w, h) => {
    c.fillStyle = "#121418";
    c.fillRect(0, 0, w, h);
    c.font = '700 30px "JetBrains Mono", monospace';
    c.fillStyle = "#fbbf24";
    c.fillText("DEPARTURES", 22, 44);
    c.font = '600 24px "JetBrains Mono", monospace';
    const rows = [
      ["BERLIN", "REMOTE", "#4ade80"],
      ["LUXEMBOURG", "REMOTE", "#4ade80"],
      ["ZÜRICH", "REMOTE", "#4ade80"],
      ["US TEAMS", "BOARDING", "#fbbf24"],
    ];
    rows.forEach(([a, b, col], i) => {
      const y = 92 + i * 42;
      c.fillStyle = "#1d2128";
      c.fillRect(16, y - 28, w - 32, 36);
      c.fillStyle = "#e5e7eb";
      c.fillText(a, 26, y);
      c.fillStyle = col;
      c.fillText(b, w - 26 - c.measureText(b).width, y);
    });
  });
  const boardFace = own(
    new THREE.MeshStandardMaterial({
      map: boardTex,
      roughness: 0.5,
      emissive: "#ffffff",
      emissiveMap: boardTex,
      emissiveIntensity: 0.15,
    }),
  );
  kit.life.boardFace = boardFace;
  cyl(0.06, 0.06, 1.6, "#4b5563", -1.05, 0, 0, g, 10);
  cyl(0.06, 0.06, 1.6, "#4b5563", 1.05, 0, 0, g, 10);
  const bm = mat("#1f2329");
  const bd = new THREE.Mesh(own(new THREE.BoxGeometry(2.4, 1.2, 0.12)), [
    bm,
    bm,
    bm,
    bm,
    boardFace,
    bm,
  ]);
  bd.position.y = 1.55;
  bd.castShadow = true;
  g.add(bd);
  rbox(2.56, 0.12, 0.24, "#2a2f37", 0, 2.15, 0, g, 0.05);
  rbox(1.0, 0.07, 0.3, "#9a6b45", -0.2, 0.25, 0.75, g, 0.03);
  rbox(1.0, 0.24, 0.05, "#9a6b45", -0.2, 0.32, 0.6, g, 0.02);
  for (const sx of [-0.6, 0.2]) rbox(0.05, 0.25, 0.26, "#3b434d", sx, 0, 0.75, g, 0.01);
  rbox(0.24, 0.32, 0.13, "#d64545", 0.65, 0, 0.8, g, 0.04);
  rbox(0.2, 0.26, 0.12, "#2c3e57", 0.92, 0, 0.72, g, 0.04);

  // the harbour: world coordinates become local (minus the board, unrotated)
  const w = new THREE.Group();
  w.rotation.y = -Math.PI / 4;
  g.add(w);
  rbox(6.2, 0.16, 1.2, "#a8794c", 20.6 - OX, -0.16, 11.6 - OZ, w, 0.05);
  for (let x = 18.2; x <= 23.5; x += 1.4) {
    cyl(0.08, 0.08, 0.7, "#6b4a2e", x - OX, -0.8, 11.05 - OZ, w, 10);
    cyl(0.08, 0.08, 0.7, "#6b4a2e", x - OX, -0.8, 12.15 - OZ, w, 10);
  }
  const flagTex = canvasTex(128, 96, (c, cw, ch) => {
    c.fillStyle = "#16181c";
    c.fillRect(0, 0, cw, ch);
    c.fillStyle = "#f2c94c";
    c.beginPath();
    c.ellipse(cw / 2, ch * 0.6, 40, 12, 0, 0, 7);
    c.fill();
    c.beginPath();
    c.ellipse(cw / 2, ch * 0.5, 24, 20, 0, Math.PI, 0);
    c.fill();
    c.fillStyle = "#d22f2f";
    c.fillRect(cw / 2 - 24, ch * 0.5 - 6, 48, 8);
  });
  const sg = new THREE.Group();
  sg.position.set(24.6 - OX, -0.4, 9.6 - OZ);
  sg.rotation.y = -Math.PI / 2.4;
  sg.userData.dynamic = true;
  w.add(sg);
  const hg = own(new THREE.CapsuleGeometry(0.5, 1.9, 6, 14));
  hg.rotateZ(Math.PI / 2);
  const hull = mk(hg, "#8a5a34", sg, 0, 0.25, 0);
  hull.scale.set(1, 1, 0.95);
  rbox(2.4, 0.08, 0.84, "#c49a6c", 0, 0.62, 0, sg, 0.03);
  rbox(0.7, 0.45, 0.9, "#7a4e2c", -0.95, 0.62, 0, sg, 0.08);
  cyl(0.05, 0.06, 2.6, "#5b3b22", 0.2, 0.62, 0, sg, 10);
  const sail = new THREE.Mesh(
    own(new THREE.CylinderGeometry(0.9, 0.9, 1.2, 16, 1, true, -Math.PI / 5, (Math.PI * 2) / 5)),
    mat("#fbf8f0", { side: THREE.DoubleSide }),
  );
  sail.rotation.y = Math.PI / 2;
  sail.position.set(-0.55, 1.65, 0);
  sail.castShadow = true;
  sg.add(sail);
  const fl = new THREE.Mesh(
    own(new THREE.PlaneGeometry(0.7, 0.5)),
    own(new THREE.MeshStandardMaterial({ map: flagTex, side: THREE.DoubleSide })),
  );
  fl.position.set(0.2, 3.05, 0.36);
  fl.rotation.y = Math.PI / 2;
  sg.add(fl);
  kit.life.ship = { g: sg, home: sg.position.clone(), sail: -1 };

  const buoys: THREE.Group[] = [];
  for (const [x, z] of [
    [25.5, 7.2],
    [27, 10.6],
    [23.4, 15.2],
    [26.6, 13.8],
  ]) {
    const b = new THREE.Group();
    b.position.set(x - OX, -0.42, z - OZ);
    b.userData.dynamic = true;
    w.add(b);
    cyl(0.13, 0.16, 0.32, "#e5484d", 0, 0, 0, b, 14);
    cyl(0.135, 0.135, 0.08, "#ffffff", 0, 0.14, 0, b, 14);
    ball(0.05, "#ffd166", 0, 0.4, 0, b, 8);
    buoys.push(b);
  }
  const rb = new THREE.Group();
  rb.position.set(19.4 - OX, -0.42, 12.75 - OZ);
  rb.rotation.y = 0.2;
  rb.userData.dynamic = true;
  w.add(rb);
  rbox(0.95, 0.2, 0.42, "#c46a3b", 0, 0, 0, rb, 0.09);
  rbox(0.8, 0.06, 0.32, "#e8d2b0", 0, 0.14, 0, rb, 0.03);
  rbox(0.08, 0.05, 0.36, "#9a6b45", 0.15, 0.2, 0, rb, 0.02);
  buoys.push(rb);
  kit.life.buoys = buoys;

  // the straw hat on the beach
  const hat = new THREE.Group();
  hat.position.set(-17.2 - OX, 0.02, 13.3 - OZ);
  hat.rotation.set(0.12, 0.6, 0);
  hat.userData.egg = "hat";
  hat.userData.kind = "hat";
  hat.userData.dynamic = true;
  w.add(hat);
  const brim = new THREE.Mesh(
    own(new THREE.CylinderGeometry(0.34, 0.34, 0.03, 24)),
    mat("#f2c94c"),
  );
  brim.position.y = 0.02;
  hat.add(brim);
  const dome = new THREE.Mesh(
    own(new THREE.SphereGeometry(0.2, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2)),
    mat("#f2c94c"),
  );
  dome.scale.y = 0.85;
  dome.position.y = 0.03;
  hat.add(dome);
  const band = new THREE.Mesh(
    own(new THREE.CylinderGeometry(0.205, 0.205, 0.06, 24)),
    mat("#d22f2f"),
  );
  band.position.y = 0.06;
  hat.add(band);
  hat.traverse((o) => {
    if ((o as THREE.Mesh).isMesh) o.castShadow = true;
  });
  kit.life.hat = hat;

  const home = (kit.life.ship as { home: THREE.Vector3 }).home;
  kit.onFrame((_dt, t) => {
    sg.position.y = home.y + Math.sin(t * 1.6) * 0.05;
    sg.rotation.z = Math.sin(t * 1.2) * 0.03;
    buoys.forEach((b, i) => {
      b.position.y = -0.42 + Math.sin(t * 1.8 + i * 1.3) * 0.045;
      b.rotation.z = Math.sin(t * 1.3 + i) * 0.1;
    });
  });
  return g;
}
