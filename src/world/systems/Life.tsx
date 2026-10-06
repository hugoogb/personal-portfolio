import { useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { useBaseCamp } from "@/store/store";
import type { BuiltWorld } from "@/world/build";

/** Ambient animation, accent painting, and sign redraw once the web fonts are in. */
export function Life({ world }: { world: BuiltWorld }) {
  const accent = useBaseCamp((s) => s.accent);
  const t = useRef(0);

  useEffect(() => world.kit.paintAccent(accent), [world, accent]);

  useEffect(() => {
    let live = true;
    void document.fonts?.ready.then(() => {
      if (live) world.kit.signTextures.forEach((tex) => tex.userData.redraw?.());
    });
    return () => {
      live = false;
    };
  }, [world]);

  useFrame((_, delta) => {
    const dt = Math.min(0.05, Math.max(0, delta));
    t.current += dt;
    world.kit.frame(dt, t.current, world.env);
  });

  return null;
}
