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
import { trackTier } from "@/utils/track";

/**
 * The frame-rate governor (spec 8) wired to rendering. It restarts its grace
 * period whenever the tier or the pixel ratio changes or rendering resumes, so
 * a paused frame never reads as a slow one. Lowering the pixel ratio is silent;
 * a tier change shows a toast.
 */
export function Governor() {
  const gov = useRef(initialGovernor());

  useEffect(() => {
    const restart = () => {
      gov.current = restartGrace(gov.current);
    };
    const unsubscribe = useBaseCamp.subscribe((s, prev) => {
      if (s.tier !== prev.tier || s.dpr !== prev.dpr || s.briefOpen !== prev.briefOpen) restart();
    });
    document.addEventListener("visibilitychange", restart);
    return () => {
      unsubscribe();
      document.removeEventListener("visibilitychange", restart);
    };
  }, []);

  useFrame((_, dt) => {
    const s = useBaseCamp.getState();
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
      const initial = s.bootTier ?? s.tier;
      const dpr = s.dpr;
      s.setTier(step.tier);
      // A step down never raises the resolution (High's 1.25 is below Medium's 1.5).
      s.setDpr(dpr);
      trackTier(initial, step.tier, "governor");
      s.toast(`Running smoother: quality set to ${TIER_NAMES[step.tier]}`);
    }
  });

  return null;
}
