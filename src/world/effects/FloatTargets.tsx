import { useThree } from "@react-three/fiber";
import type { ReactNode } from "react";
import { canRenderHalfFloat } from "@/world/effects/effectsGate";

/** Mounts its children only when the WebGL context can render the composer's half-float targets. */
export function FloatTargets({ children }: { children: ReactNode }) {
  const gl = useThree((s) => s.gl);
  return canRenderHalfFloat(gl) ? <>{children}</> : null;
}
