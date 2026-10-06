import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useBaseCamp } from "@/store/store";
import type { BuiltWorld } from "@/world/build";
import { ledColor, yardState } from "@/world/lib/status";

const EVERY_S = 0.12;
const PER_TICK = 8;

/** The yard's rack LEDs blink and follow the real status of the apps. */
export function YardLights({ world }: { world: BuiltWorld }) {
  const since = useRef(0);
  const color = useMemo(() => new THREE.Color(), []);
  useFrame((_, dt) => {
    since.current += dt;
    if (since.current < EVERY_S) return;
    since.current = 0;
    const leds = world.kit.life.leds as THREE.InstancedMesh | undefined;
    if (!leds) return;
    const state = yardState(useBaseCamp.getState().status);
    for (let i = 0; i < PER_TICK; i++) {
      leds.setColorAt(
        Math.floor(Math.random() * leds.count),
        color.set(ledColor(state, Math.random())),
      );
    }
    if (leds.instanceColor) leds.instanceColor.needsUpdate = true;
  });
  return null;
}
