import * as THREE from "three";
import { STATUS_TARGETS } from "@/content/services";
import { ORDER, PLACE_BY_ID } from "@/content/places";
import type { PlaceId } from "@/content/types";
import { bakeStatic } from "@/world/kit/bake";
import { createKit, type FrameEnv, type Kit } from "@/world/kit/kit";
import { PROP_RINGS, ringOf } from "@/world/lib/buildIn";
import { useBaseCamp } from "@/store/store";
import { PLACE_BUILDERS } from "@/world/places/index";
import { buildRoutes } from "@/world/traffic/model";
import { buildTraffic } from "@/world/traffic/build";
import { addSmoke, buildTown } from "@/world/town/town";

export interface BuiltWorld {
  kit: Kit;
  town: ReturnType<typeof buildTown>;
  places: Record<PlaceId, THREE.Group>;
  /** Props grouped by distance ring; the build-in raises each ring as one. */
  rings: THREE.Group[];
  /** Written by DayNight, read by Life. */
  env: FrameEnv;
  /** Per-service window materials, so a down service can go dark alone. */
  traffic: ReturnType<typeof buildTraffic>;
  placeWindows: Partial<
    Record<PlaceId, { win: THREE.MeshStandardMaterial; winDim: THREE.MeshStandardMaterial }>
  >;
}

/** Builds the whole town once, outside React. World disposes it on unmount. */
export function buildWorld(): BuiltWorld {
  const kit = createKit();
  const town = buildTown(kit);
  const places = Object.fromEntries(ORDER.map((id) => [id, PLACE_BUILDERS[id](kit)])) as Record<
    PlaceId,
    THREE.Group
  >;

  const traffic = buildTraffic(kit, buildRoutes());
  town.root.add(traffic.group);

  const rings = Array.from({ length: PROP_RINGS }, () => new THREE.Group());
  for (const ring of rings) town.root.add(ring);
  for (const prop of town.props) rings[ringOf(prop.position.x, prop.position.z)].attach(prop);

  const chimneys = (kit.life.chimneys as { id: PlaceId; local: THREE.Vector3 }[] | undefined) ?? [];
  addSmoke(
    kit,
    town.root,
    chimneys.map(({ id, local }) =>
      local.clone().add(new THREE.Vector3(PLACE_BY_ID[id].map.x, 0, PLACE_BY_ID[id].map.z)),
    ),
    () => useBaseCamp.getState().introDone,
  );

  // Merge static meshes to fit the draw-call budget: per material, and plain
  // colours into one vertex-coloured material. Roads, animated parts and smoke
  // are userData.dynamic, so they stay separate. What gets repainted or lit
  // at runtime keeps its own material.
  const keep = new Set<THREE.Material>([
    ...kit.accent.map((a) => a.material),
    kit.materials.win,
    kit.materials.winDim,
    kit.materials.winOff,
    kit.materials.lamp,
    kit.materials.pool,
    ...kit.signMats,
  ]);
  const placeWindows: BuiltWorld["placeWindows"] = {};
  for (const { id } of STATUS_TARGETS) {
    const win = kit.own(kit.materials.win.clone());
    const winDim = kit.own(kit.materials.winDim.clone());
    places[id].traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (!mesh.isMesh) return;
      if (mesh.material === kit.materials.win) mesh.material = win;
      else if (mesh.material === kit.materials.winDim) mesh.material = winDim;
    });
    placeWindows[id] = { win, winDim };
    keep.add(win);
    keep.add(winDim);
  }
  const board = kit.life.boardFace as THREE.Material | undefined;
  if (board) keep.add(board);
  const opts = { keep, own: kit.own, shadowProxy: true };
  for (const g of Object.values(places)) bakeStatic(g, opts);
  for (const ring of rings) bakeStatic(ring, opts);
  if (kit.buildIn.ground) bakeStatic(kit.buildIn.ground, opts);
  // Rigid moving parts (cars, ship, buoys, hat, lid) merge inside themselves
  // and keep their own shadow: the group moves, its pieces do not.
  const movers: THREE.Object3D[] = [];
  for (const g of [town.root, ...Object.values(places)]) {
    g.traverse((o) => {
      if (o.userData.dynamic && !(o as THREE.Mesh).isMesh && o.children.length > 1) movers.push(o);
    });
  }
  for (const m of movers) bakeStatic(m, { keep, own: kit.own });

  return { kit, town, places, rings, env: { night: 0, lit: 0, tier: 3 }, placeWindows, traffic };
}
