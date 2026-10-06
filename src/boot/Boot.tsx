import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ComponentType,
  type ReactNode,
} from "react";
import { bootTier, readSignals } from "@/boot/detect";
import { useBaseCamp } from "@/store/store";

interface Loaded {
  Hud: ComponentType<{ world: ReactNode }>;
  World: ComponentType<{ onReady: () => void }>;
}

/** If the town has not drawn a frame by then, the visitor gets the Brief, not a stuck title card. */
export const READY_TIMEOUT_MS = 15_000;

const html = () => document.documentElement;

const setProgress = (fraction: number) => {
  const bar = document.getElementById("title-card-progress");
  if (bar) bar.style.width = `${Math.round(fraction * 100)}%`;
};

export const leaveWorld = () => html().classList.remove("world", "world-ready", "brief-open");

/**
 * Boot sequence (spec 9.5). The head script already decided whether to try the
 * town; this runs the GPU check, then either drops to the Brief (Lite) or loads
 * the HUD and world chunks in parallel and reveals them on the first frame.
 */
export function Boot() {
  const [inWorld, setInWorld] = useState(() => html().classList.contains("world"));
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const tier = useBaseCamp((s) => s.tier);
  const briefOpen = useBaseCamp((s) => s.briefOpen);
  const timer = useRef<number | undefined>(undefined);

  const exit = useCallback(() => {
    window.clearTimeout(timer.current);
    leaveWorld();
    setLoaded(null);
    setInWorld(false);
  }, []);

  useEffect(() => {
    if (!inWorld) return;
    let cancelled = false;
    const start = async () => {
      setProgress(0.15);
      const store = useBaseCamp.getState();
      const signals = await readSignals();
      if (cancelled) return;
      const chosen = bootTier(signals, store.qualityMode);
      store.setAutoTier(chosen.auto);
      store.setTier(chosen.tier);
      if (chosen.tier === 0) return exit();
      setProgress(0.4);
      timer.current = window.setTimeout(exit, READY_TIMEOUT_MS);
      const [hud, world] = await Promise.all([import("@/hud/Hud"), import("@/world/World")]);
      if (cancelled) return;
      setProgress(0.8);
      setLoaded({ Hud: hud.Hud, World: world.default });
    };
    start().catch(exit);
    // The title card's "Read the brief" link is the way out while the town loads.
    const onHash = () => {
      if (window.location.hash === "#brief") exit();
    };
    window.addEventListener("hashchange", onHash);
    return () => {
      cancelled = true;
      window.removeEventListener("hashchange", onHash);
    };
  }, [inWorld, exit]);

  // Picking Lite in Settings, or a governor that ran out of tiers, ends the town.
  useEffect(() => {
    if (inWorld && loaded && tier === 0) exit();
  }, [inWorld, loaded, tier, exit]);

  // The Brief stays in the DOM under the town; keep it out of the tab order until it is shown.
  useEffect(() => {
    html().classList.toggle("brief-open", inWorld && briefOpen);
    document.getElementById("brief")?.toggleAttribute("inert", inWorld && !briefOpen);
  }, [inWorld, briefOpen]);

  const onReady = useCallback(() => {
    window.clearTimeout(timer.current);
    setProgress(1);
    html().classList.add("world-ready");
    const s = useBaseCamp.getState();
    s.setFirstVisit(!s.seen);
    s.markSeen();
    s.markIntroDone();
  }, []);

  const enter = () => {
    useBaseCamp.getState().setQualityMode("Low");
    html().classList.add("world");
    setInWorld(true);
  };

  if (inWorld && loaded) return <loaded.Hud world={<loaded.World onReady={onReady} />} />;
  if (!inWorld && html().classList.contains("has-webgl")) {
    return (
      <button type="button" className="enter-anyway" onClick={enter}>
        Enter the town anyway
      </button>
    );
  }
  return null;
}
