import { useBaseCamp } from "@/store/store";

/** The shell of the drive mode; the car and the ball arrive in Phase 4. */
export function DriveBar() {
  const setDriving = useBaseCamp((s) => s.setDriving);
  return (
    <div className="drivebar glass" role="region" aria-label="Driving">
      <span className="hud-label">Score</span> <strong>0</strong>
      <span className="drivebar__hint">WASD or arrows to steer · Space to boost</span>
      <button type="button" className="hud-btn" onClick={() => setDriving(false)}>
        Exit
      </button>
    </div>
  );
}
