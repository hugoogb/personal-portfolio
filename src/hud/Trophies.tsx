import { ACHIEVEMENTS } from "@/content/achievements";
import { useDialog } from "@/hud/useDialog";
import { useBaseCamp } from "@/store/store";

export function Trophies() {
  const ref = useDialog<HTMLDivElement>();
  const unlocked = useBaseCamp((s) => s.achievements);
  const setPanel = useBaseCamp((s) => s.setPanel);
  return (
    <div
      ref={ref}
      className="panel glass"
      role="dialog"
      aria-modal="true"
      aria-labelledby="trophies-title"
      tabIndex={-1}
    >
      <div className="panel__head">
        <h2 id="trophies-title" className="hud-label">
          Trophies · {unlocked.length}/{ACHIEVEMENTS.length}
        </h2>
        <button
          type="button"
          className="hud-btn hud-btn--icon"
          aria-label="Close trophies"
          onClick={() => setPanel(null)}
        >
          ×
        </button>
      </div>
      <ul className="trophies">
        {ACHIEVEMENTS.map((a) => {
          const done = unlocked.includes(a.id);
          return (
            <li key={a.id} className={`trophy${done ? " is-done" : ""}`}>
              <span className="trophy__mark" aria-hidden="true">
                {done ? "★" : "☆"}
              </span>
              <span>
                <strong>{a.name}</strong>
                <span className="trophy__hint">{a.hint}</span>
                <span className="hud-sr">{done ? "Unlocked" : "Locked"}</span>
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
