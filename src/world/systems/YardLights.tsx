import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useBaseCamp } from "@/store/store";
import { prefersReducedMotion } from "@/utils/motion";
import type { BuiltWorld } from "@/world/build";
import { ambientOn } from "@/world/lib/ambient";
import { ledColor, yardState, type YardState } from "@/world/lib/status";

const EVERY_S = 0.12;
const PER_TICK = 8;

/** The yard's rack LEDs blink and follow the real status of the apps; under reduced motion they settle instead. */
export function YardLights({ world }: { world: BuiltWorld }) {
  const since = useRef(0);
  const settled = useRef<YardState | null>(null);
  const color = useMemo(() => new THREE.Color(), []);
  useFrame((_, dt) => {
    const leds = world.kit.life.leds as THREE.InstancedMesh | undefined;
    if (!leds) return;
    if (ambientOn(prefersReducedMotion())) {
      settled.current = null;
      since.current += dt;
      if (since.current < EVERY_S) return;
      since.current = 0;
      const state = yardState(useBaseCamp.getState().status);
      for (let i = 0; i < PER_TICK; i++) {
        leds.setColorAt(
          Math.floor(Math.random() * leds.count),
          color.set(ledColor(state, Math.random())),
        );
      }
      if (leds.instanceColor) leds.instanceColor.needsUpdate = true;
      return;
    }
    // Still: colour every LED once per status change, and do nothing in between.
    const state = yardState(useBaseCamp.getState().status);
    const was = settled.current;
    if (
      was &&
      was.kind === state.kind &&
      (was.kind === "unknown" || (state.kind === "known" && was.downShare === state.downShare))
    )
      return;
    settled.current = state;
    for (let i = 0; i < leds.count; i++)
      leds.setColorAt(i, color.set(ledColor(state, i / leds.count)));
    if (leds.instanceColor) leds.instanceColor.needsUpdate = true;
  });
  return null;
}
