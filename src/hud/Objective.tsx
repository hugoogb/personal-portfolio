import { ORDER } from "@/content/places";
import { useBaseCamp } from "@/store/store";

/** First visit only (spec 4.3). */
export function Objective() {
  const firstVisit = useBaseCamp((s) => s.firstVisit);
  const found = useBaseCamp((s) => s.discovered.length);
  if (!firstVisit) return null;
  const total = ORDER.length;
  const done = found >= total;
  return (
    <aside className="objective glass" aria-label="Objective">
      <p className="hud-label">Objective</p>
      <p className="objective__text">
        {done ? "Every place found · say hello at the Post Office" : "Discover every place in town"}
      </p>
      <div
        className="progress"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={found}
      >
        <span style={{ width: `${(found / total) * 100}%` }} />
      </div>
    </aside>
  );
}
