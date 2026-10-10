import { useBaseCamp } from "@/store/store";
import type { Mode } from "@/boot/mode";
import { enterExplore, enterStory, enterText } from "@/story/transitions";

const OPTIONS: { mode: Mode; label: string; go: () => void }[] = [
  { mode: "story", label: "Story", go: () => enterStory() },
  { mode: "explore", label: "Explore", go: () => enterExplore() },
  { mode: "text", label: "Text", go: () => enterText() },
];

/** Story · Explore · Text (spec 3.4). Always visible; Explore waits for a town that can draw. */
export function ModeSwitch() {
  const mode = useBaseCamp((s) => s.mode);
  const town = useBaseCamp((s) => s.town);
  return (
    <div className="mode-switch" role="radiogroup" aria-label="View">
      {OPTIONS.map((o) => {
        const disabled = o.mode === "explore" && town !== "ready";
        return (
          <button
            key={o.mode}
            type="button"
            role="radio"
            aria-checked={mode === o.mode}
            aria-disabled={disabled || undefined}
            title={
              disabled
                ? town === "off"
                  ? "Your browser can't draw the 3D town"
                  : "The town is still loading"
                : undefined
            }
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
