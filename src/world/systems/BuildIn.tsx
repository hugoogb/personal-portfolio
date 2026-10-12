import { prefersReducedMotion } from "@/utils/motion";
import { useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import type * as THREE from "three";
import { PLACE_BY_ID } from "@/content/places";
import type { PlaceId } from "@/content/types";
import { useBaseCamp } from "@/store/store";
import type { BuiltWorld } from "@/world/build";
import {
  BUILD_IN_S,
  CAMERA_AT_S,
  OVERVIEW_VIEW,
  groundY,
  placeScale,
  ringRise,
  roadScale,
  shouldPlayBuildIn,
  skipBuildIn,
} from "@/world/lib/buildIn";

const apply = (world: BuiltWorld, t: number) => {
  const { kit, places, rings } = world;
  if (kit.buildIn.ground) kit.buildIn.ground.position.y = groundY(t);
  const k = roadScale(t);
  for (const r of kit.buildIn.roads) {
    if (r.axis === "x") {
      r.walk.scale.x = k;
      r.asph.scale.x = k;
    } else {
      r.walk.scale.z = k;
      r.asph.scale.z = k;
    }
  }
  for (const [id, g] of Object.entries(places) as [PlaceId, THREE.Group][]) {
    g.scale.y = placeScale(t, PLACE_BY_ID[id].map.x, PLACE_BY_ID[id].map.z);
  }
  rings.forEach((ring, i) => {
    ring.position.y = ringRise(t, i);
  });
};

/**
 * The first-visit build-in (spec 5.4): the island rises, roads draw out,
 * places pop from HQ outward, props rise by ring, and the camera lands at
 * 0.9 s. Returning visitors and reduced motion get the settled town at once.
 */
export function BuildIn({ world }: { world: BuiltWorld }) {
  const t = useRef(-1);

  useEffect(() => {
    const s = useBaseCamp.getState();
    if (!shouldPlayBuildIn({ firstVisit: s.firstVisit, reducedMotion: prefersReducedMotion() })) {
      apply(world, BUILD_IN_S);
      skipBuildIn(s);
      return;
    }
    s.setIntroRunning(true);
    s.focus(0, -1, OVERVIEW_VIEW, true);
    apply(world, 0);
    t.current = 0;
    // A world dropped mid-build must not leave the camera held for the next one.
    return () => useBaseCamp.getState().setIntroRunning(false);
  }, [world]);

  useFrame((_, delta) => {
    if (t.current < 0) return;
    const prev = t.current;
    // Wall-clock time, capped only against a tab-switch jump: a slow device skips frames, not seconds.
    t.current += Math.min(0.25, Math.max(0, delta));
    apply(world, Math.min(t.current, BUILD_IN_S));
    const s = useBaseCamp.getState();
    if (prev < CAMERA_AT_S && t.current >= CAMERA_AT_S) {
      s.setIntroRunning(false);
      s.reframe();
    }
    if (t.current >= BUILD_IN_S) {
      t.current = -1;
      s.markIntroDone();
    }
  });

  return null;
}
