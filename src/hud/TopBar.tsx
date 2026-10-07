import memoji from "@/assets/memojis/natural-128.png";
import { ORDER } from "@/content/places";
import { useBarcelonaHour } from "@/hooks/useBarcelonaHour";
import { toggleBrief } from "@/hud/actions";
import { liveCount } from "@/hud/pill";
import { useBaseCamp, type Panel } from "@/store/store";
import { clockText, nightAmount } from "@/world/lib/sun";

const canFullscreen = () => typeof document !== "undefined" && document.fullscreenEnabled;

const toggleFullscreen = () => {
  if (document.fullscreenElement) void document.exitFullscreen();
  else void document.documentElement.requestFullscreen?.();
};

export function TopBar() {
  const discovered = useBaseCamp((s) => s.discovered.length);
  const status = useBaseCamp((s) => s.status);
  const panel = useBaseCamp((s) => s.panel);
  const setPanel = useBaseCamp((s) => s.setPanel);
  const briefOpen = useBaseCamp((s) => s.briefOpen);
  const hour = useBarcelonaHour();
  const live = liveCount(status);
  const override = useBaseCamp((s) => s.timeOverride);
  const night = nightAmount(override ?? hour) > 0.5;
  const toggle = (p: Exclude<Panel, null>) => setPanel(panel === p ? null : p);

  return (
    <header className="hud-top glass">
      <span className="hud-crest">
        <img src={memoji} alt="" width={30} height={30} />
      </span>
      <span className="hud-name">Hugo GB</span>
      <ul className="hud-stats" aria-label="Town status">
        <li className="hud-stat" title="Projects confirmed live">
          <span className="hud-label">Live</span> {live ? `${live.ok}/${live.total}` : "-"}
        </li>
        <li className="hud-stat" title="Places discovered">
          <span className="hud-label">Found</span> {discovered}/{ORDER.length}
        </li>
        <li className="hud-stat" data-wide-only title="Time in Barcelona">
          <span className="hud-label">BCN</span> {clockText(hour)}{" "}
          <span role="img" aria-label={night ? "night" : "day"}>
            {night ? "☾" : "☀"}
          </span>
        </li>
      </ul>
      <span className="hud-top__spacer" />
      <button
        type="button"
        className="hud-btn"
        data-wide-only
        aria-expanded={panel === "trophies"}
        onClick={() => toggle("trophies")}
      >
        Trophies
      </button>
      <button
        type="button"
        className="hud-btn hud-btn--icon"
        aria-label="Settings"
        aria-expanded={panel === "settings"}
        onClick={() => toggle("settings")}
      >
        ⚙
      </button>
      <button
        type="button"
        className="hud-btn"
        data-brief-toggle
        aria-pressed={briefOpen}
        onClick={() => toggleBrief("button")}
      >
        Brief
      </button>
      {canFullscreen() && (
        <button
          type="button"
          className="hud-btn hud-btn--icon"
          data-wide-only
          aria-label="Fullscreen"
          onClick={toggleFullscreen}
        >
          ⛶
        </button>
      )}
    </header>
  );
}
