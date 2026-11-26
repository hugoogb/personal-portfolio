import type { Mode } from "@/boot/mode";
import { baseCamp } from "@/store/core";
import { enterStory } from "@/story/transitions";

export const slowNetwork = (nav: Navigator = navigator) => {
  const type = (nav as Navigator & { connection?: { effectiveType?: string } }).connection
    ?.effectiveType;
  return type === "slow-2g" || type === "2g" || type === "3g";
};

const whenIdle = (run: () => void) => {
  const idle = () =>
    typeof requestIdleCallback === "function"
      ? requestIdleCallback(run, { timeout: 1500 })
      : window.setTimeout(run, 200);
  if (typeof requestAnimationFrame === "function")
    requestAnimationFrame(() => window.setTimeout(idle, 0));
  else idle();
};

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
