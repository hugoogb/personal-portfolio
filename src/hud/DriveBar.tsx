import { useBaseCamp } from "@/store/store";

/** The drive mode's bar: the real score and the way out. */
export function DriveBar() {
  const setDriving = useBaseCamp((s) => s.setDriving);
  const score = useBaseCamp((s) => s.score);
  return (
    <div className="drivebar glass" role="region" aria-label="Driving">
      <span className="hud-label">Score</span> <strong>{score}</strong>
      <span className="drivebar__hint">WASD or arrows to steer · Space to boost</span>
      <button type="button" className="hud-btn" onClick={() => setDriving(false)}>
        Exit
      </button>
    </div>
  );
}
