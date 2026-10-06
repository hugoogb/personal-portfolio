import { useEffect } from "react";
import type { PlaceId } from "@/content/types";
import { useBaseCamp, type StatusMap } from "@/store/store";

const POLL_MS = 60_000;

export const fetchStatus = async (): Promise<StatusMap | "unknown"> => {
  try {
    const res = await fetch("/api/status");
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

/** Status on boot, then every minute while the tab is visible (spec 9.6). */
export const useStatus = () => {
  useEffect(() => {
    let alive = true;
    const tick = async () => {
      if (document.hidden) return;
      const status = await fetchStatus();
      if (alive) useBaseCamp.getState().setStatus(status);
    };
    void tick();
    const id = window.setInterval(tick, POLL_MS);
    const onVisible = () => {
      if (!document.hidden) void tick();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      alive = false;
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);
};
