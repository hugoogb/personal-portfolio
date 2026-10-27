import type { Mode } from "@/boot/mode";
import { baseCamp } from "@/store/core";
import {
  enterExplore,
  enterStory,
  enterText,
  exploreBlocked,
  LITE_HINT,
  liteOff,
} from "@/story/transitions";

const OPTIONS: { mode: Mode; label: string; go: () => void }[] = [
  { mode: "story", label: "Story", go: () => enterStory() },
  { mode: "explore", label: "Explore", go: () => enterExplore() },
  { mode: "text", label: "Text", go: () => enterText() },
];

/**
 * Story · Explore · Text (spec 3.4), in plain DOM so the first paint's code needs no React.
 * Always visible; Explore is off only where the town cannot draw. Returns the cleanup.
 */
export const mountModeSwitch = (parent: HTMLElement) => {
  const group = document.createElement("div");
  group.className = "mode-switch";
  group.setAttribute("role", "radiogroup");
  group.setAttribute("aria-label", "View");
  const buttons = OPTIONS.map((o) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "mode-switch__opt";
    b.setAttribute("role", "radio");
    b.textContent = o.label;
    group.appendChild(b);
    return b;
  });

  const off = (i: number) =>
    OPTIONS[i]!.mode === "explore" && exploreBlocked(baseCamp.getState()) !== null;

  const paint = () => {
    const s = baseCamp.getState();
    const blocked = exploreBlocked(s);
    const lite = liteOff(s);
    OPTIONS.forEach((o, i) => {
      const b = buttons[i]!;
      const on = s.mode === o.mode;
      b.tabIndex = on ? 0 : -1;
      b.setAttribute("aria-checked", String(on));
      if (off(i)) b.setAttribute("aria-disabled", "true");
      else b.removeAttribute("aria-disabled");
      const title = o.mode === "explore" ? (blocked ?? (lite ? LITE_HINT : null)) : null;
      if (title) b.title = title;
      else b.removeAttribute("title");
    });
  };

  // Radio-group keys (WAI-ARIA): arrows move and select, wrapping, skipping a disabled option.
  const onKeyDown = (e: KeyboardEvent, from: number) => {
    const step =
      e.key === "ArrowRight" || e.key === "ArrowDown"
        ? 1
        : e.key === "ArrowLeft" || e.key === "ArrowUp"
          ? -1
          : 0;
    if (!step) return;
    e.preventDefault();
    let i = from;
    for (let n = 0; n < OPTIONS.length; n++) {
      i = (i + step + OPTIONS.length) % OPTIONS.length;
      if (!off(i)) break;
    }
    // At most one option is ever off, so the loop always lands on one that is not.
    if (i === from) return;
    buttons[i]!.focus();
    if (OPTIONS[i]!.mode !== baseCamp.getState().mode) OPTIONS[i]!.go();
  };

  buttons.forEach((b, i) => {
    b.addEventListener("keydown", (e) => onKeyDown(e, i));
    b.addEventListener("click", () => {
      if (!off(i) && baseCamp.getState().mode !== OPTIONS[i]!.mode) OPTIONS[i]!.go();
    });
  });

  paint();
  parent.appendChild(group);
  const unsubscribe = baseCamp.subscribe((s, prev) => {
    if (s.mode !== prev.mode || s.town !== prev.town || s.qualityMode !== prev.qualityMode) paint();
  });
  return () => {
    unsubscribe();
    group.remove();
  };
};
