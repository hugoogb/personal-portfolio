import { useEffect } from "react";
import { openBrief } from "@/hud/actions";
import { hashTarget } from "@/hud/deeplink";
import { useBaseCamp } from "@/store/store";

/**
 * /#<slug> selects a place, /#brief, /#work and /#stack open the Brief (spec 4.5).
 * With no hash the town opens on HQ. Selecting never rewrites the URL.
 */
export const useDeepLinks = () => {
  useEffect(() => {
    const apply = (fallback: boolean) => {
      const target = hashTarget(window.location.hash);
      const s = useBaseCamp.getState();
      if (target?.type === "place") s.select(target.id);
      else if (target?.type === "brief") openBrief(target.anchor, "deeplink");
      else if (fallback) s.select("hq");
    };
    apply(true);
    const onHash = () => apply(false);
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);
};
