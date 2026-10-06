import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { PLACES } from "@/content/places";
import { CLAY, mkRand, type Kit } from "@/world/kit/kit";
import { HOMES, ISLAND } from "@/world/lib/map";

const HX = ISLAND.hx;
const HZ = ISLAND.hz;

/* The blocked-area rule (reference lines 1090-1094): where trees may not grow. */
const blockedC: [number, number, number][] = [];
for (const p of PLACES) blockedC.push([p.map.x, p.map.z, p.map.r + 0.5]);
blockedC.push([-17.2, 13.3, 0.9]);
for (const [x, z] of HOMES) blockedC.push([x, z, 1.45]);
const blockedR: [number, number, number, number][] = [
  [-16.4, -12.2, -5.6, -4.0],
  [4.5, -7.2, 5.4, -6.0],
  [-14.3, 7.9, -7.7, 14.2],
  [8.9, -12.1, 17.5, -5.2],
];
const onRoad = (x: number, z: number) =>
  Math.abs(z) < 1.3 || (Math.abs(x) < 1.3 && z < 8.3) || Math.abs(z - 7) < 1.3;
export const isBlocked = (x: number, z: number) =>
  onRoad(x, z) ||
  blockedC.some(([bx, bz, r]) => Math.hypot(x - bx, z - bz) < r) ||
  blockedR.some(([a, b, c, d]) => x > a && x < c && z > b && z < d);

/** Ground, roads, trees, lamps, parked cars, homes, beach and cloud shadows (reference 733-754, 1089-1131). */
export function buildTown(kit: Kit) {
  const { rbox, box, cyl, ball, mk, rand, materials, own } = kit;
  const root = new THREE.Group();
  const props: THREE.Object3D[] = [];
  kit.buildIn.props = props;

  /* --- ground: island, beach, water, roads --- */
  const ground = new THREE.Group();
  root.add(ground);
  kit.buildIn.ground = ground;
  const grassTex = kit.canvasTex(256, 256, (c, w, h) => {
    const r2 = mkRand(7);
    c.fillStyle = CLAY.ground.grass;
    c.fillRect(0, 0, w, h);
    for (let i = 0; i < 18; i++) {
      const x = r2() * w,
        y = r2() * h,
        rad = 16 + r2() * 34;
      const gr = c.createRadialGradient(x, y, 0, x, y, rad);
      gr.addColorStop(0, r2() < 0.5 ? "rgba(255,255,210,.06)" : "rgba(20,70,20,.06)");
      gr.addColorStop(1, "rgba(0,0,0,0)");
      c.fillStyle = gr;
      c.fillRect(x - rad, y - rad, rad * 2, rad * 2);
    }
    for (let i = 0; i < 260; i++) {
      const x = r2() * w,
        y = r2() * h;
      c.fillStyle = r2() < 0.5 ? "rgba(255,255,255,.05)" : "rgba(30,60,20,.06)";
      c.fillRect(x, y, 2, 2);
    }
  });
  grassTex.wrapS = grassTex.wrapT = THREE.RepeatWrapping;
  grassTex.repeat.set(6, 5);
  {
    const soil = kit.makeMat(CLAY.ground.soil);
    const grass = kit.makeMat(CLAY.ground.grass, { rough: 0.9, map: grassTex });
    const m = new THREE.Mesh(own(new RoundedBoxGeometry(HX * 2, 1.2, HZ * 2, 4, 0.45)), [
      soil,
      soil,
      grass,
      soil,
      soil,
      soil,
    ]);
    m.position.y = -0.6;
    m.receiveShadow = true;
    ground.add(m);
    const s = new THREE.Mesh(
      own(new RoundedBoxGeometry(HX * 2 + 1.6, 1.1, HZ * 2 + 1.6, 4, 0.7)),
      kit.makeMat(CLAY.ground.sand, { rough: 0.95 }),
    );
    s.position.y = -0.62;
    s.receiveShadow = true;
    ground.add(s);
  }
  const water = kit.own(
    new THREE.MeshStandardMaterial({ color: CLAY.water.day, roughness: 0.18, metalness: 0.08 }),
  );
  {
    const w = new THREE.Mesh(own(new THREE.PlaneGeometry(260, 260)), water);
    w.rotation.x = -Math.PI / 2;
    w.position.y = -0.38;
    w.receiveShadow = true;
    root.add(w);
  }
  const roadSeg = (x1: number, z1: number, x2: number, z2: number) => {
    const w = Math.abs(x2 - x1) + 1,
      d = Math.abs(z2 - z1) + 1,
      cx = (x1 + x2) / 2,
      cz = (z1 + z2) / 2;
    const walk = rbox(
      w + 0.5,
      0.05,
      d + 0.5,
      kit.makeMat(CLAY.ground.walk),
      cx,
      0,
      cz,
      ground,
      0.04,
      false,
    );
    const asph = rbox(w, 0.07, d, kit.makeMat(CLAY.ground.road), cx, 0, cz, ground, 0.03, false);
    walk.userData.dynamic = true;
    asph.userData.dynamic = true;
    kit.buildIn.roads.push({ walk, asph, axis: w > d ? "x" : "z" });
  };
  roadSeg(-17, 0, 17, 0);
  roadSeg(0, -13, 0, 7);
  roadSeg(-16, 7, 17, 7);
  {
    const dash = kit.makeMat("#ffffff");
    for (let x = -16.4; x <= 16.4; x += 1.2)
      if (Math.abs(x) > 1.2) box(0.5, 0.01, 0.07, dash, x, 0.07, 0, ground, false);
    for (let z = -12.4; z <= 6.4; z += 1.2)
      if (Math.abs(z) > 1.2 && Math.abs(z - 7) > 1.2)
        box(0.07, 0.01, 0.5, dash, 0, 0.07, z, ground, false);
    for (let x = -15.4; x <= 16.4; x += 1.2)
      if (Math.abs(x) > 1.2) box(0.5, 0.01, 0.07, dash, x, 0.07, 7, ground, false);
    const zebra = (x: number, z: number, alongX: boolean) => {
      for (let i = -2; i <= 2; i++) {
        if (alongX) box(0.55, 0.012, 0.1, dash, x, 0.07, z + i * 0.2, ground, false);
        else box(0.1, 0.012, 0.55, dash, x + i * 0.2, 0.07, z, ground, false);
      }
    };
    zebra(1.7, 0, true);
    zebra(-1.7, 0, true);
    zebra(0, 1.7, false);
    zebra(0, -1.7, false);
    zebra(-1.7, 7, true);
    zebra(1.7, 7, true);
  }

  /* --- trees, lamps, parked cars --- */
  const car = (x: number, z: number, rot: number, col: string, van = false) => {
    const g = new THREE.Group();
    g.position.set(x, 0, z);
    g.rotation.y = rot;
    g.userData.k = 1;
    g.userData.kind = "car";
    root.add(g);
    if (van) {
      rbox(1.05, 0.46, 0.46, col, -0.05, 0.08, 0, g, 0.1);
      rbox(0.3, 0.28, 0.44, "#cfe0ec", 0.42, 0.2, 0, g, 0.08);
    } else {
      rbox(0.82, 0.22, 0.42, col, 0, 0.08, 0, g, 0.1);
      rbox(0.46, 0.2, 0.38, "#d7e4ee", -0.04, 0.28, 0, g, 0.09);
    }
    for (const [wx, wz] of [
      [0.26, 0.21],
      [0.26, -0.21],
      [-0.26, 0.21],
      [-0.26, -0.21],
    ]) {
      const wg = new THREE.CylinderGeometry(0.1, 0.1, 0.08, 14);
      wg.rotateX(Math.PI / 2);
      mk(wg, "#1c1e22", g, wx * (van ? 1.25 : 1), 0.1, wz * (van ? 1.05 : 1));
    }
    props.push(g);
    return g;
  };
  // Reduced from the sketch (14, 10) to fit spec 10's triangle budget.
  const sphG = new THREE.SphereGeometry(1, 12, 8),
    coneG = new THREE.ConeGeometry(1, 1, 14),
    trunkG = new THREE.CylinderGeometry(0.06, 0.09, 0.55, 8);
  for (let i = 0; i < 500 && props.length < 60; i++) {
    const x = (rand() * 2 - 1) * (HX - 0.6),
      z = (rand() * 2 - 1) * (HZ - 0.6);
    if (isBlocked(x, z)) continue;
    const g = new THREE.Group();
    g.position.set(x, 0, z);
    const k = 0.75 + rand() * 0.5;
    g.scale.setScalar(k);
    g.userData.k = k;
    g.userData.kind = "tree";
    root.add(g);
    mk(trunkG, materials.trunk, g, 0, 0.27, 0);
    if (rand() < 0.32) {
      for (const [y, s] of [
        [0.75, 0.42],
        [1.08, 0.32],
        [1.35, 0.2],
      ]) {
        const c = mk(coneG, materials.pine, g, 0, y, 0);
        c.scale.set(s, 0.5, s);
      }
    } else {
      const lm = [materials.leafA, materials.leafB, materials.leafC][Math.floor(rand() * 3)];
      for (const [ox, oy, oz, s] of [
        [0, 0.85, 0, 0.4],
        [0.18, 0.72, 0.1, 0.28],
        [-0.15, 0.98, -0.08, 0.26],
      ]) {
        const c = mk(sphG, lm, g, ox, oy, oz);
        c.scale.setScalar(s);
      }
    }
    props.push(g);
  }
  for (const [x, z] of [
    [-14, -1.2],
    [-9, -1.2],
    [-5.6, -1.2],
    [6.5, -1.2],
    [11, -1.2],
    [15.5, -1.2],
    [-14.7, 1.2],
    [-6.3, 1.2],
    [9.6, 1.2],
    [14.8, 1.2],
    [1.2, -6],
    [1.2, -11.5],
    [-1.2, 5.5],
    [-12, 6.1],
    [-6, 6.1],
    [3, 6.1],
    [11.6, 6.1],
    [15, 6.1],
    [1.5, 7.9],
    [8.2, 7.9],
  ]) {
    const g = new THREE.Group();
    g.position.set(x, 0, z);
    g.userData.k = 1;
    g.userData.kind = "lamp";
    root.add(g);
    cyl(0.035, 0.05, 1.3, "#4b5563", 0, 0, 0, g, 8);
    ball(0.12, materials.lamp, 0, 1.38, 0, g, 14);
    props.push(g);
  }
  car(2.4, 7.38, 0, "#f4f4f2");
  car(9.9, 6.62, Math.PI, "#e8c547");
  car(-12, 0.38, 0, "#5b6b7a");
  car(7.5, -0.38, Math.PI, "#6aa2d8");
  car(-6.4, 6.62, Math.PI, "#d9534f");
  car(0.62, 4.9, Math.PI / 2, "#ffffff", true);
  // ordinary homes, so it reads as a town
  {
    const WALLS = ["#fbf6ec", "#f3e3cf", "#e8eef3", "#f6e7e7", "#eef3e6"],
      ROOFS = ["#c8643c", "#b5533a", "#6b7f99", "#7a8f5a", "#a65d7a"];
    HOMES.forEach(([x, z], i) => {
      const g = new THREE.Group();
      g.position.set(x, 0, z);
      g.userData.k = 1;
      g.userData.kind = "home";
      root.add(g);
      rbox(1.6, 1.05, 1.25, WALLS[i % WALLS.length], 0, 0, 0, g, 0.1);
      kit.windows(g, 1.6, 1.25, 1.05, 1, 0, 0);
      kit.door(g, 0, 0.63, "z", "#6b4a35");
      kit.gable(1.6, 1.25, 0.68, ROOFS[i % ROOFS.length], 0, 1.05, 0, g, 0.12);
      if (i % 2) rbox(0.22, 0.5, 0.22, "#a2877a", 0.45, 1.35, -0.3, g, 0.04);
      kit.bush(g, -0.95, 0.45, 0.8);
      props.push(g);
    });
  }

  /* --- beach (no gulls) --- */
  {
    const palm = (x: number, z: number, lean: number, h = 1.9) => {
      const g = new THREE.Group();
      g.position.set(x, -0.05, z);
      g.rotation.y = lean;
      g.userData.k = 1;
      g.userData.kind = "palm";
      root.add(g);
      const curve = new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0.05, h * 0.55, 0),
        new THREE.Vector3(0.42, h, 0),
      );
      mk(new THREE.TubeGeometry(curve, 10, 0.065, 8), "#9b7a55", g, 0, 0, 0);
      const top = new THREE.Group();
      top.position.set(0.42, h, 0);
      g.add(top);
      for (let k = 0; k < 7; k++) {
        const arm = new THREE.Group();
        arm.rotation.y = (k * Math.PI * 2) / 7;
        top.add(arm);
        const fr = mk(sphG, k % 2 ? "#3f8f45" : "#4fa452", arm, 0.38, -0.08, 0);
        fr.scale.set(0.42, 0.035, 0.12);
        fr.rotation.z = -0.42;
      }
      for (const [cx, cz] of [
        [0.05, 0.05],
        [-0.05, 0.04],
        [0, -0.06],
      ])
        ball(0.05, "#6b4a2e", 0.42 + cx, h - 0.06, cz, g, 8);
      props.push(g);
    };
    palm(-16.6, 14.5, 0.4);
    palm(-6.6, 14.45, -0.3, 1.7);
    palm(-1.4, 14.5, 0.9);
    palm(9.0, 14.5, 0.1, 1.8);
    palm(13.4, 14.45, 0.6, 1.7);
    palm(18.5, 4, 2.4, 1.7);
    palm(18.5, -3, 2.0);
    palm(18.5, -12.6, 2.6, 1.6);
    // On the ground group, so they rise with the island during the build-in.
    const ug = ground;
    kit.umbrella(ug, -4.2, 14.5, "#e5484d", "#ffffff");
    kit.umbrella(ug, 1.8, 14.5, "#3b82c4", "#ffffff");
    kit.umbrella(ug, 11.2, 14.5, "#f2b134", "#ffffff");
    for (const [x, c] of [
      [-3.8, "#f97316"],
      [2.2, "#2f9e8f"],
      [11.6, "#c084fc"],
    ] as const)
      rbox(0.3, 0.02, 0.55, c, x + 0.12, -0.05, 14.55, ug, 0.01, false);
    const fm = own(
      new THREE.MeshBasicMaterial({
        color: "#ffffff",
        transparent: true,
        opacity: 0.24,
        depthWrite: false,
      }),
    );
    kit.life.foam = fm;
    const foam = new THREE.Mesh(
      own(new RoundedBoxGeometry(HX * 2 + 2.7, 0.02, HZ * 2 + 2.7, 4, 1.1)),
      fm,
    );
    foam.position.y = -0.365;
    root.add(foam);
    kit.onFrame((_dt, t, env) => {
      fm.opacity = Math.max(0.08, 0.24 - env.night * 0.12 + Math.sin(t * 1.1) * 0.06);
    });
  }

  /* --- cloud shadows: one invisible instanced mesh that only the sun's shadow map draws --- */
  // It sits on layer 0: three's shadow pass tests objects against the MAIN camera's layers.
  const puffs: { cloud: number; x: number; y: number; z: number; r: number }[] = [];
  const clouds: THREE.Object3D[] = [];
  for (let i = 0; i < 6; i++) {
    const g = new THREE.Object3D();
    g.position.set(-34 + i * 12, 12 + rand() * 2, -18 + rand() * 36);
    clouds.push(g);
    for (let k = 0; k < 4; k++) {
      const r = 1.3 + rand() * 0.9;
      puffs.push({ cloud: i, x: k * 1.4 - 2.1, y: rand() * 0.5, z: rand() * 1.6 - 0.8, r });
    }
  }
  const cloudShadow = new THREE.InstancedMesh(
    own(new THREE.SphereGeometry(1, 10, 8)),
    own(new THREE.MeshBasicMaterial({ colorWrite: false, depthWrite: false })),
    puffs.length,
  );
  cloudShadow.castShadow = true;
  cloudShadow.receiveShadow = false;
  cloudShadow.frustumCulled = false;
  cloudShadow.userData.dynamic = true;
  root.add(cloudShadow);
  const cloudM = new THREE.Matrix4();
  const writeClouds = () => {
    puffs.forEach((p, i) => {
      const c = clouds[p.cloud].position;
      cloudM.makeScale(p.r, p.r, p.r).setPosition(c.x + p.x, c.y + p.y, c.z + p.z);
      cloudShadow.setMatrixAt(i, cloudM);
    });
    cloudShadow.instanceMatrix.needsUpdate = true;
  };
  writeClouds();
  kit.onFrame((dt, _t, env) => {
    // A daytime effect: an invisible mesh is not drawn into the shadow map either.
    cloudShadow.visible = env.night < 0.5;
    for (const c of clouds) {
      c.position.x += dt * 0.55;
      if (c.position.x > 38) c.position.x = -38;
    }
    writeClouds();
  });

  return { root, ground, water, props, clouds: cloudShadow };
}

/**
 * Chimney smoke (reference 1160-1161, 1459-1461): a pool of puffs drawn as one
 * instanced mesh; none on Low (spec 8), and none until `ready()` says the town
 * has been built (the build-in is still raising it before that).
 */
export function addSmoke(
  kit: Kit,
  root: THREE.Object3D,
  sources: THREE.Vector3[],
  ready: () => boolean = () => true,
) {
  const N = 36;
  const smoke = new THREE.InstancedMesh(
    kit.own(new THREE.SphereGeometry(0.16, 10, 8)),
    kit.own(
      new THREE.MeshStandardMaterial({
        color: "#f4f6f8",
        transparent: true,
        opacity: 0.55,
        roughness: 1,
        depthWrite: false,
      }),
    ),
    N,
  );
  smoke.visible = false;
  smoke.frustumCulled = false;
  smoke.userData.kind = "smoke";
  smoke.userData.dynamic = true;
  root.add(smoke);
  const puffs = Array.from({ length: N }, () => ({
    life: 0,
    pos: new THREE.Vector3(),
    scale: 0,
  }));
  const m = new THREE.Matrix4();
  const write = () => {
    let alive = 0;
    puffs.forEach((p, i) => {
      // Puffs swell as they rise, then shrink away instead of fading.
      const s = p.life > 0 ? p.scale * Math.min(1, p.life * 3) : 0;
      if (s > 0) alive++;
      m.makeScale(s, s, s).setPosition(p.pos);
      smoke.setMatrixAt(i, m);
    });
    smoke.instanceMatrix.needsUpdate = true;
    smoke.visible = alive > 0;
  };
  let smokeT = 0;
  let smokeI = 0;
  kit.onFrame((dt, _t, env) => {
    if (env.tier < 2) {
      if (smoke.visible) {
        for (const p of puffs) p.life = 0;
        write();
      }
      return;
    }
    if (ready()) {
      smokeT += dt;
      if (smokeT > 0.16) {
        smokeT = 0;
        for (const src of sources) {
          const p = puffs[smokeI++ % N];
          p.life = 1;
          p.pos.copy(src);
          p.scale = 0.6;
        }
      }
    }
    for (const p of puffs) {
      if (p.life <= 0) continue;
      p.life -= dt * 0.4;
      p.pos.y += dt * 0.7;
      p.pos.x += dt * 0.35;
      p.scale *= 1 + dt * 0.7;
    }
    write();
  });
}
