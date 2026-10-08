import * as THREE from "three";
import type { Kit } from "@/world/kit/kit";
import { LED_PALETTE } from "@/world/lib/status";

/** Server yard, a glass data centre with the racks inside (reference 1056-1081; antenna blink 1481). */
export function buildYard(kit: Kit): THREE.Group {
  const { rbox, box, cyl, mk, mat, textPlane, plaque, bush, own } = kit;
  const g = new THREE.Group();
  const W = 4.0,
    D = 2.9,
    Hh = 1.8,
    y0 = 0.15;
  rbox(4.5, 0.15, 3.3, "#d4d9df", 0, 0, 0, g, 0.06);
  rbox(W - 0.1, 0.04, D - 0.1, "#c9d1da", 0, y0, 0, g, 0.02, false);
  // racks in two rows, LEDs on their fronts, a cable tray over each row
  const pos: [number, number, number][] = [];
  for (const z of [-0.65, 0.55]) {
    for (let i = 0; i < 5; i++) {
      const x = -1.5 + i * 0.75;
      rbox(0.55, 1.25, 0.6, "#28303b", x, y0, z, g, 0.05);
      for (let k = 0; k < 6; k++)
        pos.push([x - 0.13 + (k % 2) * 0.26, y0 + 0.3 + Math.floor(k / 2) * 0.32, z + 0.31]);
    }
    box(3.6, 0.04, 0.16, "#f2b134", 0, y0 + 1.42, z, g, false);
  }
  const im = new THREE.InstancedMesh(
    own(new THREE.BoxGeometry(0.08, 0.05, 0.02)),
    own(new THREE.MeshBasicMaterial()),
    pos.length,
  );
  const m4 = new THREE.Matrix4();
  pos.forEach((p, i) => {
    m4.makeTranslation(p[0], p[1], p[2]);
    im.setMatrixAt(i, m4);
    im.setColorAt(i, new THREE.Color(LED_PALETTE(kit.rand())));
  });
  g.add(im);
  kit.life.leds = im;
  textPlane(g, "VERCEL", "#1f2329", 0.9, 0.2, -0.9, y0 + 1.62, -0.32, "#ffffff");
  textPlane(g, "VPS · DOCKER", "#1f2329", 1.1, 0.2, -0.8, y0 + 1.62, 0.88, "#4ade80");
  // glass walls and roof on a dark steel frame
  const glassM = own(
    new THREE.MeshStandardMaterial({
      color: "#bfe3f2",
      transparent: true,
      opacity: 0.16,
      roughness: 0.05,
      metalness: 0.1,
      side: THREE.DoubleSide,
      depthWrite: false,
      forceSinglePass: true,
    }),
  );
  mk(new THREE.BoxGeometry(W, Hh, D), glassM, g, 0, y0 + Hh / 2, 0, false);
  const steel = "#2c3e57";
  for (const x of [-W / 2, 0, W / 2])
    for (const z of [-D / 2, D / 2]) box(0.07, Hh, 0.07, steel, x, y0, z, g);
  for (const z of [-D / 2, D / 2]) box(W + 0.07, 0.07, 0.07, steel, 0, y0 + Hh, z, g);
  for (const x of [-W / 2, 0, W / 2]) box(0.07, 0.07, D, steel, x, y0 + Hh, 0, g);
  box(0.05, 1.1, 0.6, steel, W / 2 - 0.02, y0, 0.8, g, false);
  // outside: two AC units, a dish, an antenna on the frame
  for (const x of [-1.6, -0.9]) {
    rbox(0.5, 0.4, 0.4, "#c9cfd6", x, 0, 1.95, g, 0.05);
    cyl(0.13, 0.13, 0.03, "#6b7480", x, 0.4, 1.95, g, 14);
  }
  {
    const dish = new THREE.Mesh(
      own(new THREE.SphereGeometry(0.42, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2)),
      mat("#eef1f4", { side: THREE.DoubleSide }),
    );
    dish.rotation.x = -2.3;
    dish.position.set(1.85, 1.0, -1.95);
    dish.castShadow = true;
    g.add(dish);
    cyl(0.05, 0.07, 0.85, "#8d98a5", 1.85, 0, -1.95, g, 10);
  }
  cyl(0.03, 0.03, 0.9, "#8d98a5", -W / 2, y0 + Hh, -D / 2, g, 6);
  {
    const am = own(
      new THREE.MeshStandardMaterial({
        color: "#ff4d4d",
        emissive: "#ff2a2a",
        emissiveIntensity: 1,
      }),
    );
    const bl = new THREE.Mesh(own(new THREE.SphereGeometry(0.07, 10, 8)), am);
    bl.position.set(-W / 2, y0 + Hh + 0.95, -D / 2);
    g.add(bl);
    kit.life.antenna = am;
    kit.onFrame((_dt, t) => {
      am.emissiveIntensity = Math.floor(t * 1.3) % 2 ? 2.2 : 0.15;
    });
  }
  plaque(g, "SERVER YARD", "#475569", 0.9, 2.0, 1.1);
  bush(g, -2.4, -1.75);
  return g;
}
