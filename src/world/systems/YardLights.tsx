import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useBaseCamp, type StatusMap } from "@/store/store";
import { prefersReducedMotion } from "@/utils/motion";
import type { BuiltWorld } from "@/world/build";
import { ledColor, yardState } from "@/world/lib/status";

const EVERY_S = 0.12;
const PER_TICK = 8;

/** The yard's rack LEDs blink and follow the real status of the apps; under reduced motion they settle instead. */
export function YardLights({ world }: { world: BuiltWorld }) {
  const since = useRef(0);
  const settled = useRef<StatusMap | "unknown" | null>(null);
  const color = useMemo(() => new THREE.Color(), []);
  useFrame((_, dt) => {
    const leds = world.kit.life.leds as THREE.InstancedMesh | undefined;
    if (!leds) return;
    if (!prefersReducedMotion()) {
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
    // Still: colour every LED once per status (a new one comes every five minutes), then rest.
    const status = useBaseCamp.getState().status;
    if (settled.current === status) return;
    settled.current = status;
    const state = yardState(status);
    for (let i = 0; i < leds.count; i++)
      leds.setColorAt(i, color.set(ledColor(state, i / leds.count)));
    if (leds.instanceColor) leds.instanceColor.needsUpdate = true;
  });
  return null;
}
