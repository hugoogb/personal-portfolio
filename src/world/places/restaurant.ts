import * as THREE from "three";
import type { Kit } from "@/world/kit/kit";

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Esto no es un restaurante, a shop-front restaurant with a terrace (reference 863-887). */
export function buildRestaurant(kit: Kit): THREE.Group {
  const { rbox, cyl, ball, gable, winPick, textPlane, stripeTex, table, umbrella, bush, makeMat } =
    kit;
  const { leafA, lamp } = kit.materials;
  const g = new THREE.Group();
  rbox(3.0, 0.12, 3.0, "#e8e0d0", 0, 0, 0.15, g, 0.05);
  const b = new THREE.Group();
  b.position.z = -0.35;
  g.add(b);
  rbox(2.8, 1.55, 1.8, "#fbf6ec", 0, 0.1, 0, b, 0.12);
  // shop front: two big windows, the door, a striped awning, the name on the facade
  for (const x of [-0.85, 0.85]) {
    rbox(0.82, 0.68, 0.05, "#ffffff", x, 0.3, 0.905, b, 0.03, false);
    rbox(0.72, 0.6, 0.05, winPick(), x, 0.34, 0.92, b, 0.03, false);
    rbox(0.84, 0.1, 0.12, "#8a5a3c", x, 0.2, 0.97, b, 0.03, false);
    for (const fx of [-0.25, 0, 0.25])
      ball(0.05, fx === 0 ? "#ff8fb1" : "#ffd166", x + fx, 0.33, 0.97, b, 8);
  }
  rbox(0.48, 0.9, 0.06, "#6b4a35", 0, 0.1, 0.91, b, 0.04, false);
  {
    const aw = new THREE.Mesh(
      kit.own(new THREE.PlaneGeometry(2.7, 0.55)),
      makeMat("#ffffff", {
        map: stripeTex("#e0a526", "#fff8ea", 14),
        rough: 0.7,
        side: THREE.DoubleSide,
      }),
    );
    aw.position.set(0, 1.12, 1.12);
    aw.rotation.x = -1.05;
    aw.castShadow = true;
    b.add(aw);
    rbox(2.72, 0.08, 0.04, "#e0a526", 0, 0.86, 1.36, b, 0.02, false);
  }
  textPlane(b, "ESTO NO ES UN RESTAURANTE", "#c98f12", 2.4, 0.22, 0, 1.43, 0.91);
  // side windows with green shutters
  for (const z of [-0.45, 0.35]) {
    rbox(0.05, 0.5, 0.36, "#ffffff", 1.405, 0.6, z, b, 0.02, false);
    rbox(0.05, 0.44, 0.28, winPick(), 1.42, 0.63, z, b, 0.02, false);
    for (const s of [-0.24, 0.24])
      rbox(0.04, 0.48, 0.12, "#5f8f6a", 1.43, 0.61, z + s, b, 0.02, false);
  }
  gable(2.8, 1.8, 0.95, "#c8643c", 0, 1.65, 0, b);
  rbox(0.32, 0.9, 0.32, "#a2877a", 0.8, 1.95, -0.45, b, 0.05);
  // terrace: deck, tables, umbrellas, string lights, the "Cerrado" board
  rbox(2.8, 0.05, 1.1, "#d9c3a0", 0, 0.12, 1.15, g, 0.02);
  table(g, -0.85, 1.15, 0.17);
  table(g, 0.85, 1.15, 0.17);
  umbrella(g, -0.85, 1.15, "#e0a526", "#fff8ea", 0.5, 0.17);
  umbrella(g, 0.85, 1.15, "#e0a526", "#fff8ea", 0.5, 0.17);
  for (const x of [-1.45, 1.45]) cyl(0.025, 0.025, 1.45, "#4b4f56", x, 0.12, 1.75, g, 6);
  for (let i = 0; i <= 10; i++) {
    const t = i / 10,
      x = lerp(-1.45, 1.45, t),
      y = 1.5 - Math.sin(t * Math.PI) * 0.22;
    ball(0.035, lamp, x, y, 1.75, g, 8);
  }
  {
    const sg = new THREE.Group();
    sg.position.set(-0.15, 0.17, 1.95);
    sg.rotation.x = -0.18;
    g.add(sg);
    rbox(0.34, 0.3, 0.04, "#1f2329", 0, 0.05, 0, sg, 0.02);
    textPlane(sg, "CERRADO", "#1f2329", 0.3, 0.14, 0, 0.2, 0.025, "#ffffff", false);
  }
  // kitchen garden on the side
  for (let r = 0; r < 3; r++)
    for (let i = 0; i < 3; i++)
      ball(0.07, r === 1 ? "#e5484d" : leafA, 1.75 + i * 0.16, 0.06, -0.75 + r * 0.25, g, 8);
  bush(g, -1.65, -1.1);
  // chimney top, place-local (reference world position minus the place's x, z), for the smoke
  const chimneys = (kit.life.chimneys ??= []) as { id: string; local: THREE.Vector3 }[];
  chimneys.push({ id: "es", local: new THREE.Vector3(0.8, 2.95, -0.35 - 0.45) });
  return g;
}
