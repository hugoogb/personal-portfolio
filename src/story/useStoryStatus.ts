import { useEffect } from "react";
import type { PlaceId } from "@/content/types";
import { useBaseCamp } from "@/store/store";

/** Fills the status pills in the story document from the polled status; hidden while it is unknown. */
export const useStoryStatus = () => {
  const status = useBaseCamp((s) => s.status);
  useEffect(() => {
    document.querySelectorAll<HTMLElement>("[data-status-for]").forEach((el) => {
      const entry = status === "unknown" ? undefined : status[el.dataset.statusFor as PlaceId];
      if (!entry) {
        el.hidden = true;
        return;
      }
      el.hidden = false;
      el.textContent = entry.ok ? "Live" : "Down";
      el.dataset.state = entry.ok ? "ok" : "down";
    });
  }, [status]);
};
