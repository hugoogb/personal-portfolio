import { useCallback, useEffect, useRef, useState, type ComponentType } from "react";
import { createPortal } from "react-dom";
import { bootTier, hasWebgl2, readSignals } from "@/boot/detect";
import { READY_TIMEOUT_MS, TOWN_FAILED_KEY } from "@/boot/world";
import { WorldBoundary } from "@/boot/WorldBoundary";
import { createSafeStorage } from "@/store/storage";
import { useBaseCamp } from "@/store/store";
import { enterStory } from "@/story/transitions";
import { effectsEnabled } from "@/world/effects/effectsGate";

interface Loaded {
  World: ComponentType<{ onReady: () => void }>;
}

const loadHud = () => import("@/hud/Hud").then((m) => m.Hud);

const html = () => document.documentElement;

const session = createSafeStorage(() =>
  typeof sessionStorage === "undefined" ? undefined : sessionStorage,
);

const failedThisSession = () => session.getItem(TOWN_FAILED_KEY) === "1";

export function Town() {
  const mode = useBaseCamp((s) => s.mode);
  const town = useBaseCamp((s) => s.town);
  const tier = useBaseCamp((s) => s.tier);
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const [Hud, setHud] = useState<ComponentType | null>(null);
  const wanted = mode !== "text";
  const started = useRef(false);
  const timer = useRef<number | undefined>(undefined);

  const off = useCallback((failed: boolean) => {
    window.clearTimeout(timer.current);
    started.current = false;
    if (failed) session.setItem(TOWN_FAILED_KEY, "1");
    html().classList.remove("town-ready");
    const s = useBaseCamp.getState();
    const wasExplore = s.mode === "explore";
    useBaseCamp.setState({ consoleOpen: false, panel: null, driving: false });
    s.setTown("off");
    if (wasExplore) enterStory(undefined, { chosen: false });
    setLoaded(null);
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
      if (failedThisSession()) {
        settled = true;
        return off(false);
      }
      const arm = () => {
        timer.current = window.setTimeout(
          () => (document.hidden ? arm() : off(true)),
          READY_TIMEOUT_MS,
        );
      };
      arm();
      if (!hasWebgl2(window)) {
        settled = true;
        html().classList.add("no-webgl");
        return off(false);
      }
      const chunk = import("@/world/World");
      chunk.catch(() => {});
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
      if (effectsEnabled(chosen.tier)) import("@/world/effects/Effects").catch(() => {});
      const world = await chunk;
      if (cancelled) return;
      settled = true;
      setLoaded({ World: world.default });
    };
    const kick = () => {
      if (cancelled) return;
      start().catch(() => {
        if (cancelled) return;
        settled = true;
        off(true);
      });
    };
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
      if (!settled) {
        started.current = false;
        window.clearTimeout(timer.current);
      }
    };
  }, [wanted, town, off]);

  useEffect(() => {
    if (wanted) return;
    started.current = false;
    window.clearTimeout(timer.current);
    setLoaded(null);
    html().classList.remove("town-ready");
    const s = useBaseCamp.getState();
    if (s.town === "ready") s.setTown("loading");
  }, [wanted]);

  useEffect(() => {
    if (loaded && tier === 0) off(false);
  }, [loaded, tier, off]);

  const hudWanted = mode === "explore" && town !== "off";
  useEffect(() => {
    if (!hudWanted || Hud) return;
    let cancelled = false;
    loadHud().then(
      (component) => !cancelled && setHud(() => component),
      () => !cancelled && off(true),
    );
    return () => {
      cancelled = true;
    };
  }, [hudWanted, Hud, off]);

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
      {mode === "explore" && town === "ready" && Hud && <Hud />}
    </WorldBoundary>
  );
}
