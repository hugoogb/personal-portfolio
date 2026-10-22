import { useEffect } from "react";
import type { PlaceId } from "@/content/types";
import { useBaseCamp, type StatusMap } from "@/store/store";

const POLL_MS = 300_000;

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

/** Status on boot, then every five minutes while the tab is visible (spec 9.6). */
export const useStatus = () => {
  useEffect(() => {
    // Aborts the request in flight when the hook unmounts.
    const unmount = new AbortController();
    let seq = 0;
    let applied = 0;
    const tick = async () => {
      if (document.hidden) return;
      const mine = ++seq;
      // Each request gives up after 10 s, or at once on unmount.
      const request = new AbortController();
      const abort = () => request.abort();
      const timer = window.setTimeout(abort, TIMEOUT_MS);
      unmount.signal.addEventListener("abort", abort, { once: true });
      try {
        const status = await fetchStatus(request.signal);
        // An older response never overwrites a newer one.
        if (unmount.signal.aborted || mine < applied) return;
        applied = mine;
        useBaseCamp.getState().setStatus(status);
      } finally {
        window.clearTimeout(timer);
        unmount.signal.removeEventListener("abort", abort);
      }
    };
    void tick();
    const id = window.setInterval(tick, POLL_MS);
    const onVisible = () => {
      if (!document.hidden) void tick();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      unmount.abort();
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);
};
