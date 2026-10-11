import { useCallback, useEffect, useRef, useState, type ComponentType } from "react";
import { createPortal } from "react-dom";
import { bootTier, hasWebgl2, readSignals } from "@/boot/detect";
import { READY_TIMEOUT_MS, TOWN_FAILED_KEY } from "@/boot/world";
import { WorldBoundary } from "@/boot/WorldBoundary";
import { useBaseCamp } from "@/store/store";
import { effectsEnabled } from "@/world/effects/effectsGate";

interface Loaded {
  Hud: ComponentType;
  World: ComponentType<{ onReady: () => void }>;
}

const html = () => document.documentElement;

/**
 * The town behind the page (spec 5, 6). Text never loads it. Story and Explore
 * load it, draw it into #town-root, and Explore adds the HUD. A device that
 * cannot draw keeps the still image: Story still works, Explore stays off.
 */
export function Town() {
  const mode = useBaseCamp((s) => s.mode);
  const town = useBaseCamp((s) => s.town);
  const tier = useBaseCamp((s) => s.tier);
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const wanted = mode !== "text";
  const started = useRef(false);
  const timer = useRef<number | undefined>(undefined);

  const off = useCallback((failed: boolean) => {
    window.clearTimeout(timer.current);
    // Choosing Explore after Lite puts the town back to "loading": it must start again.
    started.current = false;
    // A device that cannot draw is remembered for the session, so a reload skips the wait.
    if (failed) {
      try {
        sessionStorage.setItem(TOWN_FAILED_KEY, "1");
      } catch {
        // Storage blocked: the next load just tries again.
      }
    }
    html().classList.remove("town-ready");
    const s = useBaseCamp.getState();
    const wasExplore = s.mode === "explore";
    useBaseCamp.setState({ consoleOpen: false, panel: null, driving: false });
    s.setTown("off");
    if (wasExplore) s.setMode("story");
    setLoaded(null);
    // Picking Lite removes the button that had focus: hand it to the switch.
    if (wasExplore && typeof requestAnimationFrame === "function")
      requestAnimationFrame(() =>
        document.querySelector<HTMLElement>('.mode-switch [aria-checked="true"]')?.focus(),
      );
  }, []);

  useEffect(() => {
    if (town === "off") return;
    if (!wanted || started.current) return;
    started.current = true;
    let cancelled = false;
    let settled = false;
    const start = async () => {
      // Bounds the whole boot: GPU check, chunk loading and the first frame.
      // A hidden tab draws no frames, so only a visible one can time out.
      const arm = () => {
        timer.current = window.setTimeout(
          () => (document.hidden ? arm() : off(true)),
          READY_TIMEOUT_MS,
        );
      };
      arm();
      // The WebGL2 probe runs here, after first paint, not in the head script. Without it the
      // story stays on the still image and Explore says why it is off.
      if (!hasWebgl2(window)) {
        settled = true;
        html().classList.add("no-webgl");
        return off(false);
      }
      html().classList.add("has-webgl");
      // The town's code downloads while the GPU check runs, not after it.
      const chunks = Promise.all([import("@/hud/Hud"), import("@/world/World")]);
      chunks.catch(() => {});
      const store = useBaseCamp.getState();
      const chosen = bootTier(await readSignals(), store.qualityMode);
      if (cancelled) return;
      store.setAutoTier(chosen.auto);
      store.setTier(chosen.tier);
      store.setFirstVisit(!store.seen);
      if (chosen.tier === 0) {
        settled = true;
        return off(false);
      }
      // High draws through the composer: fetch it alongside the world, so it is in by the first
      // frame. A failure here is left to the world's own import, whose boundary drops the effects.
      if (effectsEnabled(chosen.tier)) import("@/world/effects/Effects").catch(() => {});
      const [hud, world] = await chunks;
      if (cancelled) return;
      settled = true;
      setLoaded({ Hud: hud.Hud, World: world.default });
    };
    const kick = () => {
      if (cancelled) return;
      start().catch(() => {
        if (cancelled) return;
        settled = true;
        off(true);
      });
    };
    // Explore starts at once. Story waits for the first paint (a frame, then a task after it) and
    // an idle browser, so the text and the still image get the network and the main thread first
    // (spec 6.1). The ready timer is armed in start(), so the wait does not count against it.
    let frame: number | undefined;
    let after: number | undefined;
    let idle: number | undefined;
    let fallback: number | undefined;
    const whenIdle = () => {
      if (typeof requestIdleCallback === "function")
        idle = requestIdleCallback(kick, { timeout: 1500 });
      else fallback = window.setTimeout(kick, 200);
    };
    if (useBaseCamp.getState().mode === "explore") kick();
    else if (typeof requestAnimationFrame === "function")
      frame = requestAnimationFrame(() => (after = window.setTimeout(whenIdle, 0)));
    else whenIdle();
    return () => {
      cancelled = true;
      if (idle !== undefined && typeof cancelIdleCallback === "function") cancelIdleCallback(idle);
      window.clearTimeout(fallback);
      window.clearTimeout(after);
      if (frame !== undefined && typeof cancelAnimationFrame === "function")
        cancelAnimationFrame(frame);
      // Interrupted before it finished (StrictMode's rehearsal, or Text mid-load): start over next time.
      if (!settled) {
        started.current = false;
        window.clearTimeout(timer.current);
      }
    };
  }, [wanted, town, off]);

  // Text never draws the town: unmount it, and load it again for a later Story.
  useEffect(() => {
    if (wanted) return;
    started.current = false;
    window.clearTimeout(timer.current);
    setLoaded(null);
    html().classList.remove("town-ready");
    const s = useBaseCamp.getState();
    if (s.town === "ready") s.setTown("loading");
  }, [wanted]);

  // Lite in Settings, or a governor out of tiers: the town goes, the story stays.
  useEffect(() => {
    if (loaded && tier === 0) off(false);
  }, [loaded, tier, off]);

  const onReady = useCallback(() => {
    window.clearTimeout(timer.current);
    html().classList.add("town-ready");
    const s = useBaseCamp.getState();
    s.setTown("ready");
    s.markSeen();
  }, []);

  const root = typeof document !== "undefined" ? document.getElementById("town-root") : null;
  if (!loaded || !root || !wanted) return null;
  return (
    <WorldBoundary onError={() => off(true)}>
      {createPortal(<loaded.World onReady={onReady} />, root)}
      {/* The HUD waits for the first frame: until then the still image shows (spec 3.4). */}
      {mode === "explore" && town === "ready" && <loaded.Hud />}
    </WorldBoundary>
  );
}
