import { useRef, type KeyboardEvent } from "react";
import { useBaseCamp } from "@/store/store";
import type { Mode } from "@/boot/mode";
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

/** Story · Explore · Text (spec 3.4). Always visible; Explore is off only where the town cannot draw. */
export function ModeSwitch() {
  const mode = useBaseCamp((s) => s.mode);
  const town = useBaseCamp((s) => s.town);
  const qualityMode = useBaseCamp((s) => s.qualityMode);
  const blocked = exploreBlocked({ town, qualityMode });
  const lite = liteOff({ town, qualityMode });
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const off = (i: number) => OPTIONS[i]!.mode === "explore" && blocked !== null;
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
    if (i === from || off(i)) return;
    refs.current[i]?.focus();
    if (OPTIONS[i]!.mode !== mode) OPTIONS[i]!.go();
  };
  return (
    <div className="mode-switch" role="radiogroup" aria-label="View">
      {OPTIONS.map((o, i) => {
        const isExplore = o.mode === "explore";
        const disabled = isExplore && blocked !== null;
        return (
          <button
            key={o.mode}
            ref={(el) => {
              refs.current[i] = el;
            }}
            tabIndex={mode === o.mode ? 0 : -1}
            onKeyDown={(e) => onKeyDown(e, i)}
            type="button"
            role="radio"
            aria-checked={mode === o.mode}
            aria-disabled={disabled || undefined}
            title={isExplore ? (blocked ?? (lite ? LITE_HINT : undefined)) : undefined}
            className="mode-switch__opt"
            onClick={() => !disabled && mode !== o.mode && o.go()}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
