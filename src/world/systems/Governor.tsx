import { useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import {
  TIER_NAMES,
  effectiveDpr,
  governorTick,
  initialGovernor,
  restartGrace,
} from "@/boot/tiers";
import { useBaseCamp } from "@/store/store";

export function Governor() {
  const gov = useRef(initialGovernor());

  useEffect(() => {
    const restart = () => {
      gov.current = restartGrace(gov.current);
    };
    const unsubscribe = useBaseCamp.subscribe((s, prev) => {
      if (
        s.tier !== prev.tier ||
        s.dpr !== prev.dpr ||
        s.mode !== prev.mode ||
        s.idle !== prev.idle
      )
        restart();
    });
    document.addEventListener("visibilitychange", restart);
    return () => {
      unsubscribe();
      document.removeEventListener("visibilitychange", restart);
    };
  }, []);

  useFrame((_, dt) => {
    const s = useBaseCamp.getState();
    if (s.idle) return;
    const before = gov.current;
    const { state, step } = governorTick(before, dt, {
      auto: s.qualityMode === "auto",
      tier: s.tier,
      dpr: effectiveDpr(s.dpr, window.devicePixelRatio),
      introDone: s.introDone,
    });
    gov.current = state;
    if (state.fps !== before.fps) s.setFps(Math.round(state.fps));
    if (step?.kind === "dpr") s.setDpr(step.dpr);
    if (step?.kind === "tier") {
      const dpr = s.dpr;
      s.setTier(step.tier);
      s.setDpr(dpr);
      s.toast(`Running smoother: quality set to ${TIER_NAMES[step.tier]}`);
    }
  });

  return null;
}
