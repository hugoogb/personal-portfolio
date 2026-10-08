import { useEffect } from "react";
import type { PlaceId } from "@/content/types";
import { useBaseCamp, type StatusMap } from "@/store/store";

const POLL_MS = 60_000;

const TIMEOUT_MS = 10_000;

export const fetchStatus = async (signal?: AbortSignal): Promise<StatusMap | "unknown"> => {
  try {
    const res = await fetch("/api/status", { signal });
    if (!res.ok) return "unknown";
    const body = (await res.json()) as { services?: unknown };
    if (!Array.isArray(body?.services)) return "unknown";
    const map: StatusMap = {};
    for (const p of body.services as { id?: unknown; ok?: unknown; ms?: unknown }[]) {
      if (typeof p?.id !== "string") continue;
      map[p.id as PlaceId] = { ok: p.ok === true, ms: typeof p.ms === "number" ? p.ms : null };
    }
    return map;
  } catch {
    return "unknown";
  }
};

/** A request signal that aborts on timeout or unmount; AbortSignal.any is missing before Safari 17.4, Chrome 116 and Firefox 124. */
const requestSignal = (unmount: AbortSignal): { signal: AbortSignal; done: () => void } => {
  if (typeof AbortSignal.any === "function" && typeof AbortSignal.timeout === "function")
    return { signal: AbortSignal.any([AbortSignal.timeout(TIMEOUT_MS), unmount]), done: () => {} };
  const ac = new AbortController();
  const abort = () => ac.abort();
  const timer = window.setTimeout(abort, TIMEOUT_MS);
  if (unmount.aborted) abort();
  else unmount.addEventListener("abort", abort, { once: true });
  return {
    signal: ac.signal,
    done: () => {
      window.clearTimeout(timer);
      unmount.removeEventListener("abort", abort);
    },
  };
};

/** Status on boot, then every minute while the tab is visible (spec 9.6). */
export const useStatus = () => {
  useEffect(() => {
    let alive = true;
    // Aborts the request in flight when the hook unmounts.
    const unmount = new AbortController();
    let seq = 0;
    let applied = 0;
    const tick = async () => {
      if (document.hidden) return;
      const mine = ++seq;
      const req = requestSignal(unmount.signal);
      try {
        const status = await fetchStatus(req.signal);
        // An older response never overwrites a newer one.
        if (!alive || mine < applied) return;
        applied = mine;
        useBaseCamp.getState().setStatus(status);
      } finally {
        req.done();
      }
    };
    void tick();
    const id = window.setInterval(tick, POLL_MS);
    const onVisible = () => {
      if (!document.hidden) void tick();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      alive = false;
      unmount.abort();
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);
};
