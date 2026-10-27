import type { Mode } from "@/boot/mode";
import { baseCamp } from "@/store/core";
import { enterStory } from "@/story/transitions";

/**
 * 2G or 3G by the Network Information API (Chromium only; elsewhere this is false).
 * The town is a few hundred KB and a busy GPU: on such a link Story keeps the still
 * image, and the town loads only when the visitor picks Explore.
 */
export const slowNetwork = (nav: Navigator = navigator) => {
  const type = (nav as Navigator & { connection?: { effectiveType?: string } }).connection
    ?.effectiveType;
  return type === "slow-2g" || type === "2g" || type === "3g";
};

/** After the first paint (a frame, then a task) and an idle browser, as Town itself waits in Story. */
const whenIdle = (run: () => void) => {
  const idle = () =>
    typeof requestIdleCallback === "function"
      ? requestIdleCallback(run, { timeout: 1500 })
      : window.setTimeout(run, 200);
  if (typeof requestAnimationFrame === "function")
    requestAnimationFrame(() => window.setTimeout(idle, 0));
  else idle();
};

/**
 * Loads React and the town's boot (src/boot/TownApp.tsx) the first time a mode wants it:
 * at once for Explore, when idle for Story, never for Text. From then on Town owns it.
 */
export const startTown = (parent: HTMLElement, before: Node | null) => {
  let state: "idle" | "waiting" | "loading" | "mounted" = "idle";
  const load = () => {
    if (state === "loading" || state === "mounted") return;
    const { mode, town } = baseCamp.getState();
    if (mode === "text" || town === "off") {
      state = "idle";
      return;
    }
    state = "loading";
    import("@/boot/TownApp")
      .then(({ mountTown }) => {
        mountTown(parent, before);
        state = "mounted";
      })
      .catch(() => {
        // Offline or a failed deploy: the page stays on the still image; a later pick retries.
        state = "idle";
        if (baseCamp.getState().mode === "explore") enterStory(undefined, { chosen: false });
      });
  };
  const sync = (mode: Mode) => {
    if (state === "loading" || state === "mounted") return;
    if (mode === "explore") return load();
    if (mode === "story" && state === "idle" && !slowNetwork()) {
      state = "waiting";
      whenIdle(load);
    }
  };
  sync(baseCamp.getState().mode);
  baseCamp.subscribe((s, prev) => {
    if (s.mode !== prev.mode || s.town !== prev.town) sync(s.mode);
  });
};
