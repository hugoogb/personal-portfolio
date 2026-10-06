import * as THREE from "three";
import { mkRand, type Kit } from "@/world/kit/kit";

/** HQ, Hugo's studio: glass ground floor with the desk setup, an accent volume over the back, a rooftop terrace (reference 755-802). */
export function buildHq(kit: Kit): THREE.Group {
  const { rbox, box, cyl, ball, mk, canvasTex, plaque, bush, materials, own } = kit;
  const { leafA, leafB } = materials;
  const g = new THREE.Group();
  rbox(3.1, 0.16, 2.9, "#ddd6c8", 0, 0, 0, g, 0.06);
  rbox(2.7, 0.04, 2.2, "#e3d6c0", 0, 0.16, 0, g, 0.02, false);
  rbox(1.6, 0.012, 1.0, "#3b434d", -0.1, 0.2, 0.45, g, 0.01, false);
  // glass shell on a dark steel frame
  const glassM = own(
    new THREE.MeshStandardMaterial({
      color: "#cfe8f5",
      transparent: true,
      opacity: 0.14,
      roughness: 0.05,
      metalness: 0.1,
      side: THREE.DoubleSide,
      depthWrite: false,
    }),
  );
  mk(new THREE.BoxGeometry(2.8, 1.3, 2.3), glassM, g, 0, 0.16 + 0.65, 0, false);
  for (const x of [-1.4, 1.4])
    for (const z of [-1.15, 1.15]) box(0.06, 1.3, 0.06, "#23272e", x, 0.16, z, g);
  box(2.86, 0.06, 0.06, "#23272e", 0, 1.44, 1.15, g);
  box(0.06, 0.06, 2.3, "#23272e", 1.4, 1.44, 0, g);
  box(0.06, 0.06, 2.3, "#23272e", -1.4, 1.44, 0, g);
  // the setup: a desk, an ultrawide and a vertical monitor, keyboard, mic arm, headphones, speakers, lamp
  const codeTex = (seed: number) =>
    canvasTex(160, 64, (c, w, h) => {
      c.fillStyle = "#14171c";
      c.fillRect(0, 0, w, h);
      const r2 = mkRand(seed);
      const cols = ["#f97316", "#60a5fa", "#4ade80", "#e5e7eb", "#c084fc", "#fbbf24"];
      for (let y = 6; y < h - 3; y += 6) {
        let x = 5 + Math.floor(r2() * 4) * 7;
        while (x < w - 8) {
          const len = 5 + r2() * 20;
          c.fillStyle = cols[Math.floor(r2() * cols.length)];
          c.fillRect(x, y, len, 2.5);
          x += len + 4;
          if (r2() < 0.22) break;
        }
      }
    });
  rbox(1.6, 0.05, 0.6, "#c49a6c", -0.1, 0.62, 0.55, g, 0.02);
  for (const [lx, lz] of [
    [-0.82, 0.32],
    [0.62, 0.32],
    [-0.82, 0.78],
    [0.62, 0.78],
  ])
    cyl(0.022, 0.022, 0.46, "#23272e", lx, 0.16, lz, g, 6);
  rbox(0.86, 0.32, 0.04, "#1f2329", -0.25, 0.8, 0.33, g, 0.02);
  {
    const sc = new THREE.Mesh(
      own(new THREE.PlaneGeometry(0.8, 0.27)),
      own(new THREE.MeshBasicMaterial({ map: codeTex(3) })),
    );
    sc.position.set(-0.25, 0.96, 0.355);
    g.add(sc);
  }
  cyl(0.02, 0.03, 0.14, "#4b4f56", -0.25, 0.67, 0.32, g, 6);
  {
    const vm = new THREE.Group();
    vm.position.set(0.42, 0.67, 0.36);
    vm.rotation.y = -0.35;
    g.add(vm);
    rbox(0.26, 0.46, 0.04, "#1f2329", 0, 0.12, 0, vm, 0.02);
    const sc = new THREE.Mesh(
      own(new THREE.PlaneGeometry(0.22, 0.42)),
      own(new THREE.MeshBasicMaterial({ map: codeTex(8) })),
    );
    sc.position.set(0, 0.35, 0.022);
    vm.add(sc);
    cyl(0.02, 0.03, 0.12, "#4b4f56", 0, 0, 0, vm, 6);
  }
  box(0.46, 0.02, 0.14, "#2a2f37", -0.25, 0.67, 0.62, g, false);
  box(0.07, 0.02, 0.1, "#2a2f37", 0.12, 0.67, 0.64, g, false);
  cyl(0.012, 0.012, 0.34, "#4b4f56", -0.82, 0.67, 0.42, g, 6);
  box(0.03, 0.03, 0.3, "#4b4f56", -0.82, 1.0, 0.55, g, false);
  cyl(0.04, 0.04, 0.12, "#23272e", -0.82, 0.94, 0.68, g, 10);
  {
    mk(new THREE.TorusGeometry(0.07, 0.018, 6, 14, Math.PI), "#23272e", g, 0.66, 0.86, 0.6);
    cyl(0.012, 0.012, 0.18, "#4b4f56", 0.66, 0.67, 0.6, g, 6);
  }
  for (const x of [-0.78, 0.3]) rbox(0.1, 0.16, 0.1, "#2a2f37", x, 0.67, 0.36, g, 0.02);
  cyl(0.012, 0.012, 0.3, "#4b4f56", 0.58, 0.67, 0.42, g, 6);
  mk(new THREE.ConeGeometry(0.07, 0.08, 12), materials.lamp, g, 0.58, 1.0, 0.45);
  // accent LED strip under the desk, and an accent stripe on the chair
  {
    const led = own(
      new THREE.MeshStandardMaterial({
        color: "#f97316",
        emissive: "#f97316",
        emissiveIntensity: 1.6,
      }),
    );
    kit.accent.push({ material: led, mode: "both" });
    mk(new THREE.BoxGeometry(1.5, 0.02, 0.02), led, g, -0.1, 0.6, 0.26, false);
    mk(new THREE.BoxGeometry(0.02, 0.02, 0.5), led, g, 0.68, 0.6, 0.55, false);
  }
  {
    const ch = new THREE.Group();
    ch.position.set(-0.2, 0.16, 1.05);
    ch.rotation.y = Math.PI + 0.25;
    g.add(ch);
    cyl(0.03, 0.03, 0.22, "#4b4f56", 0, 0, 0, ch, 6);
    for (let k = 0; k < 5; k++) {
      const a = (k / 5) * Math.PI * 2;
      box(0.16, 0.02, 0.03, "#23272e", Math.cos(a) * 0.08, 0.02, Math.sin(a) * 0.08, ch, false);
    }
    rbox(0.36, 0.08, 0.34, "#1f2329", 0, 0.22, 0, ch, 0.04);
    rbox(0.34, 0.5, 0.07, "#1f2329", 0, 0.3, -0.16, ch, 0.04);
    const st = own(new THREE.MeshStandardMaterial({ color: "#f97316", roughness: 0.5 }));
    kit.accent.push({ material: st, mode: "color" });
    mk(new THREE.BoxGeometry(0.06, 0.48, 0.075), st, ch, 0, 0.55, -0.16);
  }
  // plants and a bookshelf under the upper floor
  cyl(0.11, 0.09, 0.24, "#e9e4da", 1.05, 0.16, 0.8, g, 12);
  ball(0.22, leafB, 1.05, 0.58, 0.8, g, 10);
  ball(0.15, leafA, 1.12, 0.8, 0.75, g, 8);
  rbox(1.4, 1.0, 0.3, "#9a6b45", -0.55, 0.16, -0.95, g, 0.02);
  for (let i = 0; i < 3; i++)
    for (let k = 0; k < 6; k++)
      box(
        0.15,
        0.2,
        0.12,
        ["#e5484d", "#2f9e8f", "#ffd166", "#3e63dd", "#f97316", "#7c5cff"][(i + k) % 6],
        -1.05 + k * 0.2,
        0.27 + i * 0.3,
        -0.86,
        g,
        false,
      );
  // upper floor: a volume in your accent colour over the back half, cantilevered to the east
  rbox(3.0, 1.0, 1.45, materials.accentRoof, 0.35, 1.47, -0.48, g, 0.1);
  rbox(1.94, 0.8, 0.06, "#23272e", -0.05, 1.57, 0.255, g, 0.02, false);
  rbox(1.84, 0.7, 0.05, materials.win, -0.05, 1.62, 0.275, g, 0.02, false);
  box(0.03, 0.7, 0.04, "#23272e", -0.05, 1.62, 0.3, g, false);
  rbox(0.04, 0.9, 1.3, "#7a5232", 1.86, 1.52, -0.48, g, 0.01, false);
  for (let i = 0; i < 7; i++)
    box(0.035, 0.9, 0.08, "#b98552", 1.885, 1.52, -1.05 + i * 0.19, g, false);
  rbox(3.4, 0.07, 1.85, "#f4f2ee", 0.4, 2.47, -0.38, g, 0.02);
  // rooftop terrace: deck, glass rail, two loungers, a plant
  rbox(1.6, 0.03, 1.15, "#c49a6c", -0.4, 2.54, -0.45, g, 0.01, false);
  {
    const rail = own(
      new THREE.MeshStandardMaterial({
        color: "#cfe8f5",
        transparent: true,
        opacity: 0.3,
        roughness: 0.05,
        side: THREE.DoubleSide,
        depthWrite: false,
      }),
    );
    mk(new THREE.BoxGeometry(1.6, 0.26, 0.02), rail, g, -0.4, 2.7, 0.13, false);
    mk(new THREE.BoxGeometry(0.02, 0.26, 1.15), rail, g, 0.4, 2.7, -0.45, false);
    box(1.62, 0.025, 0.03, "#23272e", -0.4, 2.83, 0.13, g, false);
    box(0.03, 0.025, 1.15, "#23272e", 0.4, 2.83, -0.45, g, false);
  }
  for (const x of [-0.95, -0.5]) {
    rbox(0.26, 0.05, 0.5, "#f4f2ee", x, 2.6, -0.45, g, 0.02);
    const bk = rbox(0.26, 0.05, 0.26, "#f4f2ee", x, 2.62, -0.78, g, 0.02);
    bk.rotation.x = 0.7;
  }
  cyl(0.1, 0.08, 0.18, "#e9e4da", 0.15, 2.57, -0.85, g, 10);
  ball(0.16, leafB, 0.15, 2.86, -0.85, g, 10);
  // outside: a bike in your accent colour, the plaque, planters
  {
    const bk = new THREE.Group();
    bk.position.set(1.62, 0, 1.75);
    bk.rotation.y = Math.PI / 3;
    g.add(bk);
    const tg = new THREE.TorusGeometry(0.14, 0.018, 6, 20);
    for (const x of [-0.2, 0.2]) mk(tg, "#1f2329", bk, x, 0.16, 0);
    // the reference reuses the roof material here; the brief registers the bike as its own accent part
    const frame = own(new THREE.MeshStandardMaterial({ color: "#f97316", roughness: 0.6 }));
    kit.accent.push({ material: frame, mode: "color" });
    box(0.42, 0.025, 0.025, frame, 0, 0.27, 0, bk, false);
    box(0.025, 0.16, 0.025, frame, -0.08, 0.2, 0, bk, false);
    box(0.12, 0.025, 0.06, "#1f2329", -0.1, 0.36, 0, bk, false);
  }
  plaque(g, "HUGO GB · HQ", "#1f2329", -0.6, 1.85, 1.0);
  for (const sx of [-1.45, 0.55]) {
    rbox(0.3, 0.26, 0.3, "#cfc6b4", sx, 0, 1.62, g, 0.06);
    ball(0.17, leafB, sx, 0.42, 1.62, g, 10);
  }
  bush(g, -1.65, -1.45);
  bush(g, 1.75, -1.2);
  // the flag flies from the roof corner
  cyl(0.035, 0.035, 1.1, "#3b434d", 1.9, 2.54, -1.1, g);
  const flag = new THREE.Mesh(own(new THREE.PlaneGeometry(0.7, 0.4, 8, 1)), materials.accentFlag);
  flag.position.set(2.28, 3.42, -1.1);
  flag.castShadow = true;
  flag.userData.y = 3.42;
  flag.userData.dynamic = true;
  g.add(flag);
  kit.onFrame((_dt, t) => {
    flag.rotation.y = Math.sin(t * 3) * 0.22;
    flag.position.y = flag.userData.y + Math.sin(t * 2.2) * 0.02;
  });
  return g;
}
