import { HexColorPicker } from "react-colorful";
import { TIER_NAMES, type QualityMode } from "@/boot/tiers";
import { PRESET_COLORS } from "@/constants/colors.constants";
import { useBarcelonaHour } from "@/hooks/useBarcelonaHour";
import { useDialog } from "@/hud/useDialog";
import { useBaseCamp, type HudMode } from "@/store/store";
import { clockText, nightAmount } from "@/world/lib/sun";

const QUALITY: QualityMode[] = ["auto", ...TIER_NAMES];
const HUD_MODES: { mode: HudMode; label: string }[] = [
  { mode: "auto", label: "Auto" },
  { mode: "light", label: "Light" },
  { mode: "dark", label: "Dark" },
];

export function Settings() {
  const ref = useDialog<HTMLDivElement>();
  const accent = useBaseCamp((s) => s.accent);
  const setAccent = useBaseCamp((s) => s.setAccent);
  const qualityMode = useBaseCamp((s) => s.qualityMode);
  const setQualityMode = useBaseCamp((s) => s.setQualityMode);
  const hudMode = useBaseCamp((s) => s.hudMode);
  const setHudMode = useBaseCamp((s) => s.setHudMode);
  const tier = useBaseCamp((s) => s.tier);
  const fps = useBaseCamp((s) => s.fps);
  const setPanel = useBaseCamp((s) => s.setPanel);
  const hour = useBarcelonaHour();
  const night = nightAmount(hour) > 0.5;

  return (
    <div
      ref={ref}
      className="panel glass"
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-title"
      tabIndex={-1}
    >
      <div className="panel__head">
        <h2 id="settings-title" className="hud-label">
          Settings
        </h2>
        <button
          type="button"
          className="hud-btn hud-btn--icon"
          aria-label="Close settings"
          onClick={() => setPanel(null)}
        >
          ×
        </button>
      </div>
      <fieldset className="panel__group">
        <legend className="hud-label">Accent</legend>
        <div className="swatches">
          {PRESET_COLORS.map((c) => (
            <button
              key={c.color}
              type="button"
              className="swatch"
              style={{ background: c.color }}
              aria-label={c.name}
              aria-pressed={accent === c.color}
              onClick={() => setAccent(c.color)}
            />
          ))}
        </div>
        <details className="panel__custom">
          <summary>Custom colour</summary>
          <HexColorPicker color={accent} onChange={setAccent} />
        </details>
      </fieldset>
      <fieldset className="panel__group">
        <legend className="hud-label">Quality</legend>
        <div className="segmented">
          {QUALITY.map((mode) => (
            <label key={mode}>
              <input
                type="radio"
                name="quality"
                checked={qualityMode === mode}
                onChange={() => setQualityMode(mode)}
              />
              <span>{mode === "auto" ? "Auto" : mode}</span>
            </label>
          ))}
        </div>
        <p className="panel__note">
          {TIER_NAMES[tier]} · {fps} fps
        </p>
      </fieldset>
      <fieldset className="panel__group">
        <legend className="hud-label">HUD</legend>
        <div className="segmented">
          {HUD_MODES.map(({ mode, label }) => (
            <label key={mode}>
              <input
                type="radio"
                name="hud"
                checked={hudMode === mode}
                onChange={() => setHudMode(mode)}
              />
              <span>{label}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <section className="panel__group panel__time" aria-label="Time in Barcelona">
        <h3 className="hud-label">Barcelona</h3>
        <p>
          {clockText(hour)} · {night ? "Night" : "Day"}
        </p>
      </section>
    </div>
  );
}
