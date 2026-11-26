import * as THREE from "three";
import { STATUS_TARGETS } from "@/content/services";
import { ORDER, PLACE_BY_ID } from "@/content/places";
import type { PlaceId } from "@/content/types";
import { bakeStatic } from "@/world/kit/bake";
import { createKit, type FrameEnv, type Kit } from "@/world/kit/kit";
import { PROP_RINGS, ringOf } from "@/world/lib/buildIn";
import { useBaseCamp } from "@/store/store";
import { GLOW, SCREEN, type TallyLife } from "@/world/places/tally";
import { PLACE_BUILDERS } from "@/world/places/index";
import { buildRoutes } from "@/world/traffic/model";
import { buildTraffic } from "@/world/traffic/build";
import { addSmoke, buildTown } from "@/world/town/town";

export interface BuiltWorld {
  kit: Kit;
  town: ReturnType<typeof buildTown>;
  places: Record<PlaceId, THREE.Group>;
  rings: THREE.Group[];
  env: FrameEnv;
  traffic: ReturnType<typeof buildTraffic>;
  placeWindows: Partial<
    Record<
      PlaceId,
      {
        win: THREE.MeshStandardMaterial;
        winDim: THREE.MeshStandardMaterial;
        glows: { material: THREE.MeshStandardMaterial; base: number }[];
      }
    >
  >;
}

export function* buildSteps(kit: Kit): Generator<void, BuiltWorld> {
  const town = buildTown(kit);
  yield;
  const places = {} as Record<PlaceId, THREE.Group>;
  for (const id of ORDER) {
    places[id] = PLACE_BUILDERS[id](kit);
    yield;
  }

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
    const tally = kit.life.tally as TallyLife;
    const glows =
      id === "wt"
        ? [
            { material: tally.glow, base: GLOW },
            { material: tally.screen, base: SCREEN },
          ]
        : [];
    placeWindows[id] = { win, winDim, glows };
    keep.add(win);
    keep.add(winDim);
    for (const { material } of glows) keep.add(material);
  }
  const board = kit.life.boardFace as THREE.Material | undefined;
  if (board) keep.add(board);
  const opts = { keep, own: kit.own, shadowProxy: true };
  for (const g of Object.values(places)) {
    bakeStatic(g, opts);
    yield;
  }
  for (const ring of rings) bakeStatic(ring, opts);
  yield;
  if (kit.buildIn.ground) bakeStatic(kit.buildIn.ground, opts);
  yield;
  const movers: THREE.Object3D[] = [];
  for (const g of [town.root, ...Object.values(places)]) {
    g.traverse((o) => {
      if (o.userData.dynamic && !(o as THREE.Mesh).isMesh && o.children.length > 1) movers.push(o);
    });
  }
  for (const m of movers) bakeStatic(m, { keep, own: kit.own });

  return { kit, town, places, rings, env: { night: 0, lit: 0, tier: 3 }, placeWindows, traffic };
}

export function buildWorld(): BuiltWorld {
  const steps = buildSteps(createKit());
  for (;;) {
    const step = steps.next();
    if (step.done) return step.value;
  }
}

const SLICE_MS = 12;
export const nextTask = (): Promise<void> => {
  const scheduler = (globalThis as { scheduler?: { yield?: () => Promise<void> } }).scheduler;
  if (typeof scheduler?.yield === "function") return scheduler.yield();
  return new Promise((resolve) => {
    const channel = new MessageChannel();
    channel.port1.onmessage = () => {
      channel.port1.close();
      resolve();
    };
    channel.port2.postMessage(null);
  });
};

export async function buildWorldInSlices(signal: AbortSignal): Promise<BuiltWorld | null> {
  const kit = createKit();
  const steps = buildSteps(kit);
  try {
    for (;;) {
      const end = performance.now() + SLICE_MS;
      for (;;) {
        const step = steps.next();
        if (step.done) {
          if (!signal.aborted) return step.value;
          kit.dispose();
          return null;
        }
        if (performance.now() >= end) break;
      }
      await nextTask();
      if (signal.aborted) {
        kit.dispose();
        return null;
      }
    }
  } catch (error) {
    kit.dispose();
    throw error;
  }
}
