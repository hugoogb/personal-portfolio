import { PLACES } from "@/content/places";
import { useBaseCamp } from "@/store/store";

/** A visually hidden list of the places, first in the tab order after the top bar (spec 9.7). */
export function PlacesList() {
  const selected = useBaseCamp((s) => s.selected);
  const select = useBaseCamp((s) => s.select);
  return (
    <nav className="hud-sr" aria-label="Places in town">
      <ul>
        {PLACES.map((p) => (
          <li key={p.id}>
            <button
              type="button"
              aria-current={selected === p.id ? "true" : undefined}
              onClick={() => select(p.id)}
            >
              {p.name}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
