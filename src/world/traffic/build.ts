import * as THREE from "three";
import type { Kit } from "@/world/kit/kit";
import { LANE, laneEdges, type Route } from "@/world/traffic/model";

export interface TrafficMeshes {
  group: THREE.Group;
  lanes: THREE.InstancedMesh;
  /** The lane chevron texture; the system scrolls its offset. */
  chev: THREE.Texture;
  req: THREE.InstancedMesh;
  reqTrail: THREE.InstancedMesh;
  res: THREE.InstancedMesh;
  resTrail: THREE.InstancedMesh;
  rings: THREE.InstancedMesh;
  /** The roads the packets follow, shared with the system that moves them. */
  routes: Route[];
  /** Trail dots per packet. */
  TRAIL: number;
}

const NREQ = 20;
const NRES = 10;
const NRINGS = 16;
const TRAIL = 3;

/**
 * Instanced road traffic (reference 1132-1157): direction lanes, request and
 * response capsules with trails, and the pulse rings. Everything is dynamic
 * and casts no shadow; Traffic.tsx writes the matrices each frame.
 */
export function buildTraffic(kit: Kit, routes: Route[]): TrafficMeshes {
  const group = new THREE.Group();
  group.userData.dynamic = true;

  const chev = kit.canvasTex(64, 16, (c, w, h) => {
    c.clearRect(0, 0, w, h);
    c.strokeStyle = "#ffffff";
    c.lineWidth = 3;
    for (let x = 4; x < w; x += 16) {
      c.beginPath();
      c.moveTo(x, 3);
      c.lineTo(x + 7, h / 2);
      c.lineTo(x, h - 3);
      c.stroke();
    }
  });
  chev.wrapS = THREE.RepeatWrapping;
  chev.repeat.set(2, 1);

  const laneM = kit.own(
    new THREE.MeshBasicMaterial({
      map: chev,
      color: "#f97316",
      transparent: true,
      opacity: 0.7,
      depthWrite: false,
    }),
  );
  const trailM = kit.own(
    new THREE.MeshBasicMaterial({
      color: "#f97316",
      transparent: true,
      opacity: 0.45,
      depthWrite: false,
    }),
  );
  const packetMat = kit.own(
    new THREE.MeshStandardMaterial({
      color: "#f97316",
      emissive: "#f97316",
      emissiveIntensity: 0.9,
      roughness: 0.4,
    }),
  );
  kit.life.packetMat = packetMat;
  kit.accent.push(
    { material: laneM, mode: "color" },
    { material: trailM, mode: "color" },
    { material: packetMat, mode: "both" },
  );
  const green = new THREE.MeshBasicMaterial({ color: "#4ade80" });
  const respM = kit.own(green);
  const respTrailM = kit.own(
    new THREE.MeshBasicMaterial({
      color: "#4ade80",
      transparent: true,
      opacity: 0.4,
      depthWrite: false,
    }),
  );
  const ringM = kit.own(
    new THREE.MeshBasicMaterial({
      color: "#ffffff",
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
    }),
  );
  ringM.forceSinglePass = true;

  const laneG = new THREE.PlaneGeometry(1, 0.17);
  laneG.rotateX(-Math.PI / 2);
  const capG = new THREE.CapsuleGeometry(0.07, 0.2, 4, 10);
  capG.rotateZ(Math.PI / 2);
  const dotG = new THREE.SphereGeometry(0.06, 10, 8);
  const ringG = new THREE.RingGeometry(0.16, 0.24, 28);
  for (const g of [laneG, capG, dotG, ringG]) kit.own(g);

  const edges = laneEdges(routes);
  const lanes = new THREE.InstancedMesh(laneG, laneM, edges.length);
  const m4 = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const up = new THREE.Vector3(0, 1, 0);
  const one = new THREE.Vector3(1, 1, 1);
  const pp = new THREE.Vector3();
  edges.forEach(([a, b], k) => {
    const dx = b[0] - a[0];
    const dz = b[1] - a[1];
    pp.set((a[0] + b[0]) / 2 - dz * LANE, 0.085, (a[1] + b[1]) / 2 + dx * LANE);
    q.setFromAxisAngle(up, Math.atan2(-dz, dx));
    lanes.setMatrixAt(k, m4.compose(pp, q, one));
  });

  const req = new THREE.InstancedMesh(capG, packetMat, NREQ);
  const reqTrail = new THREE.InstancedMesh(dotG, trailM, NREQ * TRAIL);
  const res = new THREE.InstancedMesh(capG, respM, NRES);
  const resTrail = new THREE.InstancedMesh(dotG, respTrailM, NRES * TRAIL);
  const rings = new THREE.InstancedMesh(ringG, ringM, NRINGS);

  const hidden = new THREE.Matrix4().makeScale(0, 0, 0);
  const black = new THREE.Color(0, 0, 0);
  for (const mesh of [req, reqTrail, res, resTrail, rings]) {
    for (let i = 0; i < mesh.count; i++) mesh.setMatrixAt(i, hidden);
    mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  }
  for (let i = 0; i < NRINGS; i++) rings.setColorAt(i, black);

  for (const mesh of [lanes, req, reqTrail, res, resTrail, rings]) {
    mesh.castShadow = false;
    mesh.receiveShadow = false;
    mesh.frustumCulled = false;
    group.add(mesh);
  }

  return { group, lanes, chev, req, reqTrail, res, resTrail, rings, routes, TRAIL };
}
