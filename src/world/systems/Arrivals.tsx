import { useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import type { PlaceId } from "@/content/types";
import { useBaseCamp } from "@/store/store";
import { prefersReducedMotion } from "@/utils/motion";
import type { BuiltWorld } from "@/world/build";
import { ARRIVAL_S, arrivalPulse } from "@/world/lib/arrivals";

interface Active {
  id: PlaceId;
  t: number;
  win: number;
  winDim: number;
  glows: number[];
}

export function Arrivals({ world }: { world: BuiltWorld }) {
  const active = useRef<Active | null>(null);
  useEffect(
    () =>
      useBaseCamp.subscribe((s, prev) => {
        if (!s.arrival || s.arrival === prev.arrival || prefersReducedMotion()) return;
        const set = world.placeWindows[s.arrival.id];
        if (!set) return;
        active.current = {
          id: s.arrival.id,
          t: 0,
          win: set.win.emissiveIntensity,
          winDim: set.winDim.emissiveIntensity,
          glows: set.glows.map((g) => g.material.emissiveIntensity),
        };
      }),
    [world],
  );
  useFrame((_, delta) => {
    const a = active.current;
    if (!a) return;
    a.t += Math.min(0.05, Math.max(0, delta));
    const set = world.placeWindows[a.id];
    if (set) {
      const k = 1 + 1.5 * arrivalPulse(a.t);
      set.win.emissiveIntensity = a.win * k;
      set.winDim.emissiveIntensity = a.winDim * k;
      set.glows.forEach((g, i) => (g.material.emissiveIntensity = a.glows[i] * k));
    }
    if (a.t >= ARRIVAL_S) active.current = null;
  });
  return null;
}
