import * as THREE from "three";
import type { Kit } from "@/world/kit/kit";

/** The post office: an ochre civic building with a clock tower and a big envelope (reference 1008-1039). */
export function buildPostOffice(kit: Kit): THREE.Group {
  const { rbox, cyl, ball, mk, hip, canvasTex, textPlane, bush, mat, own } = kit;
  const g = new THREE.Group();
  const OCH = "#f0cf7a",
    BLUE = "#2c5fa8";
  rbox(3.2, 0.14, 2.6, "#d9d2c4", 0, 0, 0, g, 0.05);
  rbox(2.8, 1.6, 2.0, OCH, 0, 0.14, -0.1, g, 0.12);
  rbox(0.7, 1.0, 0.08, BLUE, 0, 0.14, 0.92, g, 0.04, false);
  {
    const ar = mk(new THREE.TorusGeometry(0.36, 0.06, 8, 24, Math.PI), "#ffffff", g, 0, 1.14, 0.95);
    ar.castShadow = false;
  }
  for (const x of [-0.95, 0.95]) {
    rbox(0.36, 0.72, 0.05, "#ffffff", x, 0.4, 0.905, g, 0.02, false);
    rbox(0.28, 0.64, 0.05, kit.winPick(), x, 0.44, 0.92, g, 0.02, false);
  }
  rbox(2.9, 0.12, 2.1, BLUE, 0, 1.74, -0.1, g, 0.04);
  // roof sign
  rbox(1.5, 0.32, 0.07, BLUE, 0.55, 1.86, 0.82, g, 0.03);
  textPlane(g, "POST OFFICE", BLUE, 1.4, 0.24, 0.55, 2.02, 0.86);
  // envelope on the facade
  {
    const env = canvasTex(160, 100, (c, w, h) => {
      c.fillStyle = "#ffffff";
      c.fillRect(0, 0, w, h);
      c.strokeStyle = BLUE;
      c.lineWidth = 7;
      c.strokeRect(4, 4, w - 8, h - 8);
      c.beginPath();
      c.moveTo(6, 8);
      c.lineTo(w / 2, h * 0.6);
      c.lineTo(w - 6, 8);
      c.stroke();
      c.fillStyle = "#e5484d";
      c.fillRect(w - 34, 14, 20, 24);
    });
    const em = new THREE.Mesh(
      own(new THREE.PlaneGeometry(0.62, 0.39)),
      own(new THREE.MeshStandardMaterial({ map: env, roughness: 0.6 })),
    );
    em.position.set(-0.95, 1.32, 0.915);
    g.add(em);
  }
  // clock tower
  rbox(0.8, 1.55, 0.8, OCH, -0.85, 1.86, -0.55, g, 0.06);
  {
    const clk = canvasTex(128, 128, (c) => {
      c.fillStyle = "#ffffff";
      c.beginPath();
      c.arc(64, 64, 60, 0, 7);
      c.fill();
      c.strokeStyle = "#1f2329";
      c.lineWidth = 6;
      c.stroke();
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2;
        c.lineWidth = 4;
        c.beginPath();
        c.moveTo(64 + Math.cos(a) * 44, 64 + Math.sin(a) * 44);
        c.lineTo(64 + Math.cos(a) * 52, 64 + Math.sin(a) * 52);
        c.stroke();
      }
      c.lineWidth = 6;
      c.beginPath();
      c.moveTo(64, 64);
      c.lineTo(64, 30);
      c.moveTo(64, 64);
      c.lineTo(88, 72);
      c.stroke();
    });
    const cm = own(new THREE.MeshStandardMaterial({ map: clk, transparent: true, roughness: 0.5 }));
    const cg = own(new THREE.CircleGeometry(0.27, 32));
    const c1 = new THREE.Mesh(cg, cm);
    c1.position.set(-0.85, 2.95, -0.14);
    g.add(c1);
    const c2 = new THREE.Mesh(cg, cm);
    c2.position.set(-0.44, 2.95, -0.55);
    c2.rotation.y = Math.PI / 2;
    g.add(c2);
  }
  hip(0.8, 0.8, 0.6, BLUE, -0.85, 3.41, -0.55, g);
  // parcel lockers on the east wall, a red pillar box, a flag
  for (let r = 0; r < 3; r++)
    for (let k = 0; k < 4; k++)
      rbox(
        0.04,
        0.26,
        0.3,
        ["#3b82c4", "#7aa7dc"][(r + k) % 2],
        1.43,
        0.3 + r * 0.3,
        -0.75 + k * 0.34,
        g,
        0.02,
        false,
      );
  cyl(0.14, 0.14, 0.6, "#d93a3a", 1.55, 0, 1.25, g, 16);
  ball(0.14, "#d93a3a", 1.55, 0.6, 1.25, g, 16);
  rbox(0.16, 0.03, 0.04, "#1f2329", 1.55, 0.45, 1.39, g, 0.01, false);
  cyl(0.03, 0.03, 1.6, "#9aa3ad", -1.5, 0.14, 1.15, g, 6);
  {
    const fl = new THREE.Mesh(
      own(new THREE.PlaneGeometry(0.5, 0.3)),
      mat(BLUE, { side: THREE.DoubleSide }),
    );
    fl.position.set(-1.24, 1.55, 1.15);
    g.add(fl);
  }
  rbox(0.3, 0.22, 0.24, "#c49a6c", 0.55, 0.14, 1.2, g, 0.03);
  rbox(0.24, 0.18, 0.2, "#b3875a", 0.82, 0.14, 1.25, g, 0.03);
  bush(g, -1.35, -1.15);
  bush(g, 1.4, -1.1);
  return g;
}
