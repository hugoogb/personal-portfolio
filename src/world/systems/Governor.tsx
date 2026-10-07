import { useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { TIER_NAMES, governorTick, initialGovernor, restartGrace, type Tier } from "@/boot/tiers";
import { useBaseCamp } from "@/store/store";
import { trackTier } from "@/utils/track";

/**
 * The frame-rate governor (spec 8) wired to rendering. It restarts its grace
 * period whenever the tier changes or rendering resumes, so a paused frame
 * never reads as a slow one.
 */
export function Governor() {
  const gov = useRef(initialGovernor());

  useEffect(() => {
    const restart = () => {
      gov.current = restartGrace(gov.current);
    };
    const unsubscribe = useBaseCamp.subscribe((s, prev) => {
      if (s.tier !== prev.tier || s.briefOpen !== prev.briefOpen) restart();
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
    const { state, stepDown } = governorTick(before, dt, {
      auto: s.qualityMode === "auto",
      tier: s.tier,
      introDone: s.introDone,
    });
    gov.current = state;
    const windowEnded = before.windowTime > 0 && state.windowTime === 0 && before.grace === 0;
    if (windowEnded) s.setFps(Math.round(state.fps));
    if (stepDown) {
      const next = (s.tier - 1) as Tier;
      const initial = s.bootTier ?? s.tier;
      s.setTier(next);
      trackTier(initial, next, "governor");
      s.toast(`Running smoother: quality set to ${TIER_NAMES[next]}`);
    }
  });

  return null;
}
