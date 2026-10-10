import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ComponentType,
  type ReactNode,
} from "react";
import { bootTier, readSignals } from "@/boot/detect";
import { leaveWorld, READY_TIMEOUT_MS, TOWN_FAILED_KEY } from "@/boot/world";
import { WorldBoundary } from "@/boot/WorldBoundary";
import { useBaseCamp } from "@/store/store";
import { effectsEnabled } from "@/world/effects/effectsGate";

interface Loaded {
  Hud: ComponentType<{ world: ReactNode }>;
  World: ComponentType<{ onReady: () => void }>;
}

const html = () => document.documentElement;

const setProgress = (fraction: number) => {
  const bar = document.getElementById("title-card-progress");
  if (bar) bar.style.width = `${Math.round(fraction * 100)}%`;
};

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

  // "#brief" only leaves the town while it is still loading; after that the overlay handles it.
  const loadedRef = useRef(false);

  const exit = useCallback(() => {
    window.clearTimeout(timer.current);
    leaveWorld();
    useBaseCamp.setState({ briefOpen: false, consoleOpen: false, panel: null });
    loadedRef.current = false;
    setLoaded(null);
    setInWorld(false);
    // Picking Lite removes the button that had focus; the Brief is where the visitor lands.
    requestAnimationFrame(() => {
      const brief = document.getElementById("brief");
      brief?.setAttribute("tabindex", "-1");
      brief?.focus({ preventScroll: true });
    });
  }, []);

  // A device that cannot draw is remembered for the session, so a reload skips the wait.
  const fail = useCallback(() => {
    try {
      sessionStorage.setItem(TOWN_FAILED_KEY, "1");
    } catch {
      // Storage blocked: the next load just tries again.
    }
    exit();
  }, [exit]);

  useEffect(() => {
    if (!inWorld) return;
    let cancelled = false;
    const start = async () => {
      // Bounds the whole boot: GPU check, chunk loading and the first frame.
      // A hidden tab draws no frames, so only a visible one can time out.
      const arm = () => {
        timer.current = window.setTimeout(() => {
          if (document.hidden) arm();
          else fail();
        }, READY_TIMEOUT_MS);
      };
      arm();
      setProgress(0.15);
      // The town's code downloads while the GPU check runs, not after it. A Lite verdict
      // leaves it unused, and the head script has already turned away most of those.
      const chunks = Promise.all([import("@/hud/Hud"), import("@/world/World")]);
      chunks.catch(() => {});
      const store = useBaseCamp.getState();
      const signals = await readSignals();
      if (cancelled) return;
      const chosen = bootTier(signals, store.qualityMode);
      store.setAutoTier(chosen.auto);
      store.setTier(chosen.tier);
      store.setFirstVisit(!store.seen);
      if (chosen.tier === 0) return exit();
      // High draws through the composer: fetch it alongside the world, so it is in by the first
      // frame. A failure here is left to the world's own import, whose boundary drops the effects.
      if (effectsEnabled(chosen.tier)) import("@/world/effects/Effects").catch(() => {});
      setProgress(0.4);
      const [hud, world] = await chunks;
      if (cancelled) return;
      setProgress(0.8);
      loadedRef.current = true;
      setLoaded({ Hud: hud.Hud, World: world.default });
    };
    start().catch(fail);
    // The title card's "Read the brief" link is the way out while the town loads.
    const onHash = () => {
      if (window.location.hash === "#brief" && !loadedRef.current) exit();
    };
    window.addEventListener("hashchange", onHash);
    return () => {
      cancelled = true;
      window.clearTimeout(timer.current);
      window.removeEventListener("hashchange", onHash);
    };
  }, [inWorld, exit, fail]);

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
    useBaseCamp.getState().markSeen();
  }, []);

  const enter = () => {
    try {
      sessionStorage.removeItem(TOWN_FAILED_KEY);
    } catch {
      // Nothing to clear.
    }
    useBaseCamp.getState().setQualityMode("Low");
    html().classList.add("world");
    setInWorld(true);
  };

  if (inWorld && loaded) {
    return (
      <WorldBoundary onError={fail}>
        <loaded.Hud world={<loaded.World onReady={onReady} />} />
      </WorldBoundary>
    );
  }
  if (!inWorld && html().classList.contains("has-webgl")) {
    return (
      <button type="button" className="enter-anyway" onClick={enter}>
        Enter the town anyway
      </button>
    );
  }
  return null;
}
