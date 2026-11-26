import { inject as injectAnalytics } from "@vercel/analytics";
import { injectSpeedInsights } from "@vercel/speed-insights";
import { startAccentFavicon } from "@/client/accentFavicon";
import { startStatus } from "@/client/status";
import { startTown } from "@/client/town";
import { baseCamp } from "@/store/core";
import { startHashRoutes } from "@/story/hashRoutes";
import { mountModeSwitch } from "@/story/modeSwitch";
import { startStoryDriver } from "@/story/storyDriver";
import { startStoryStatus } from "@/story/storyStatus";
import { enterExplore, exploreBlocked } from "@/story/transitions";

const syncDocument = () => {
  const { mode, town, qualityMode } = baseCamp.getState();
  document.getElementById("story")?.toggleAttribute("inert", mode === "explore");
  document.getElementById("rail")?.toggleAttribute("inert", mode === "explore");
  const cta = document.querySelector<HTMLButtonElement>("[data-explore-cta]");
  const blocked = exploreBlocked({ town, qualityMode });
  if (cta) cta.disabled = mode !== "story" || blocked !== null;
  const why = document.getElementById("explore-why");
  if (why) {
    why.textContent = blocked ?? "";
    why.hidden = blocked === null;
  }
  if (blocked) cta?.setAttribute("aria-describedby", "explore-why");
  else cta?.removeAttribute("aria-describedby");
};

const wireRailChip = () => {
  const chip = document.getElementById("rail-chip") as HTMLDetailsElement | null;
  if (!chip) return;
  document.addEventListener("click", (e) => {
    if (!chip.open) return;
    const target = e.target instanceof Element ? e.target : null;
    if (!target || target.closest("[data-rail-chip]") || !chip.contains(target)) chip.open = false;
  });
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape" || !chip.open) return;
    chip.open = false;
    chip.querySelector("summary")?.focus();
  });
};

export const startClient = (root: HTMLElement) => {
  injectAnalytics();
  injectSpeedInsights();
  startAccentFavicon();
  startStatus();
  startStoryStatus();
  requestAnimationFrame(() => window.setTimeout(startStoryDriver, 0));
  startHashRoutes();
  syncDocument();
  baseCamp.subscribe((s, prev) => {
    if (s.mode !== prev.mode || s.town !== prev.town || s.qualityMode !== prev.qualityMode)
      syncDocument();
  });
  wireRailChip();
  document
    .querySelector<HTMLButtonElement>("[data-explore-cta]")
    ?.addEventListener("click", () => enterExplore());
  const switchSlot = document.createElement("div");
  switchSlot.style.display = "contents";
  root.appendChild(switchSlot);
  mountModeSwitch(switchSlot);
  startTown(root, switchSlot);
};
