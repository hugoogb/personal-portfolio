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
  return (
    <div className="mode-switch" role="radiogroup" aria-label="View">
      {OPTIONS.map((o) => {
        const isExplore = o.mode === "explore";
        const disabled = isExplore && blocked !== null;
        return (
          <button
            key={o.mode}
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
