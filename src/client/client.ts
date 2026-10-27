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

/** The finale's prompt and the inert story follow the mode and the town. The document is never hydrated. */
const syncDocument = () => {
  const { mode, town, qualityMode } = baseCamp.getState();
  document.getElementById("story")?.toggleAttribute("inert", mode === "explore");
  document.getElementById("rail")?.toggleAttribute("inert", mode === "explore");
  const cta = document.querySelector<HTMLButtonElement>("[data-explore-cta]");
  // Same rule as the switch's Explore option, and the same reason, shown under the button.
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

/** The phone chip's list closes on a pick, a tap outside it, or Esc. */
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

/**
 * Everything on the page that needs JavaScript, without React: the mode switch, the
 * tour, the status pills, the favicon. React comes with the town, which Text never loads.
 */
export const startClient = (root: HTMLElement) => {
  injectSpeedInsights();
  startAccentFavicon();
  // Polling runs in every mode; the pills and the tour only matter in the story document.
  startStatus();
  startStoryStatus();
  // After the first frame: the browser's own scroll to a #section has to land before the first
  // announce, whose replaceState would otherwise cancel it (this entry runs before first paint).
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
  // The town's React root goes before the switch, so in Explore the switch is the HUD's last tab stop.
  const switchSlot = document.createElement("div");
  switchSlot.style.display = "contents";
  root.appendChild(switchSlot);
  mountModeSwitch(switchSlot);
  startTown(root, switchSlot);
};
