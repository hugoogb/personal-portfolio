import * as THREE from "three";
import type { Kit } from "@/world/kit/kit";
import { LANE, laneEdges, type Route } from "@/world/traffic/model";

export interface TrafficMeshes {
  group: THREE.Group;
  /** Faint guide lines along both lanes of every road the traffic uses. */
  lanes: THREE.InstancedMesh;
  /** The flow streaks: one accent line per message, whichever way it travels, in up to PIECES pieces. */
  flows: THREE.InstancedMesh;
  rings: THREE.InstancedMesh;
  /** The roads the flows follow, shared with the system that moves them. */
  routes: Route[];
}

const NFLOW = 12;
/** Pieces per streak: a straight run, plus one per corner it can span. */
export const PIECES = 3;
const NRINGS = 16;
/** Streak length in cells; the system scales it down near a route's ends. */
export const STREAK = 1.2;

/**
 * Instanced road traffic: guide lines, flow streaks and the pulse rings. The
 * user asked (10 Oct) for flow lines rather than packets, with no difference
 * between requests and responses, so both directions draw the same accent
 * streak. Everything is dynamic and casts no shadow; Traffic.tsx writes the
 * matrices each frame.
 */
export function buildTraffic(kit: Kit, routes: Route[]): TrafficMeshes {
  const group = new THREE.Group();
  group.userData.dynamic = true;

  const laneM = kit.own(
    new THREE.MeshBasicMaterial({
      color: "#f97316",
      transparent: true,
      opacity: 0.22,
      depthWrite: false,
    }),
  );
  const flowM = kit.own(
    new THREE.MeshBasicMaterial({
      color: "#f97316",
      transparent: true,
      opacity: 0.85,
      depthWrite: false,
    }),
  );
  // A streak bent round a corner is several pieces. Each carries its slice of
  // the tail-to-head fade (flowRange), so the fade runs on unbroken.
  flowM.onBeforeCompile = (shader) => {
    shader.vertexShader = shader.vertexShader
      .replace(
        "#include <common>",
        "#include <common>\nattribute vec2 flowRange;\nvarying float vFlow;",
      )
      .replace(
        "#include <begin_vertex>",
        // The piece runs from x = -1 (its tail) to x = 0 (its head).
        "#include <begin_vertex>\nvFlow = mix(flowRange.x, flowRange.y, position.x + 1.0);",
      );
    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", "#include <common>\nvarying float vFlow;")
      .replace(
        "#include <color_fragment>",
        "#include <color_fragment>\ndiffuseColor.a *= vFlow * vFlow;",
      );
  };
  flowM.customProgramCacheKey = () => "flow";
  kit.life.flowMat = flowM;
  kit.accent.push({ material: laneM, mode: "color" }, { material: flowM, mode: "color" });
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

  const laneG = new THREE.PlaneGeometry(1, 0.035);
  laneG.rotateX(-Math.PI / 2);
  // Unit length along +x with its head at the origin; the system stretches it to the streak.
  const flowG = new THREE.PlaneGeometry(1, 0.1);
  flowG.translate(-0.5, 0, 0);
  flowG.rotateX(-Math.PI / 2);
  const ringG = new THREE.RingGeometry(0.16, 0.24, 28);
  for (const g of [laneG, flowG, ringG]) kit.own(g);

  // Both lanes of each edge: flows run either way.
  const edges = laneEdges(routes).flatMap(([a, b]) => [
    [a, b],
    [b, a],
  ]);
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

  const flows = new THREE.InstancedMesh(flowG, flowM, NFLOW * PIECES);
  const range = new THREE.InstancedBufferAttribute(new Float32Array(NFLOW * PIECES * 2), 2);
  range.setUsage(THREE.DynamicDrawUsage);
  flowG.setAttribute("flowRange", range);
  const rings = new THREE.InstancedMesh(ringG, ringM, NRINGS);

  const hidden = new THREE.Matrix4().makeScale(0, 0, 0);
  const black = new THREE.Color(0, 0, 0);
  for (const mesh of [flows, rings]) {
    for (let i = 0; i < mesh.count; i++) mesh.setMatrixAt(i, hidden);
    mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  }
  for (let i = 0; i < NRINGS; i++) rings.setColorAt(i, black);

  for (const mesh of [lanes, flows, rings]) {
    mesh.castShadow = false;
    mesh.receiveShadow = false;
    mesh.frustumCulled = false;
    group.add(mesh);
  }

  return { group, lanes, flows, rings, routes };
}
