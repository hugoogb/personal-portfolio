import type { PlaceId } from "@/content/types";
import { baseCamp, type BaseCampState } from "@/store/core";

/** Fills the status pills in the story document from the polled status; hidden while it is unknown. */
const paint = (status: BaseCampState["status"]) => {
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
};

export const startStoryStatus = () => {
  paint(baseCamp.getState().status);
  return baseCamp.subscribe((s, prev) => {
    if (s.status !== prev.status) paint(s.status);
  });
};
