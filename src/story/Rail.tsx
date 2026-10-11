import { RAIL_STOPS } from "@/content/tour";

/** The section index (spec 4.5): a rail on desktop, a chip on phones. Plain links, so it works without JavaScript. */
export function Rail() {
  return (
    <nav id="rail" aria-label="Sections">
      <ol className="rail">
        {RAIL_STOPS.map((s) => (
          <li key={s.id}>
            <a href={`#${s.anchor}`} data-rail={s.id} className="rail__dot">
              <span className="rail__label">{s.label}</span>
            </a>
          </li>
        ))}
      </ol>
      <details id="rail-chip" className="rail-chip">
        <summary>
          <span data-rail-count>1 / {RAIL_STOPS.length}</span> ·{" "}
          <span data-rail-label>{RAIL_STOPS[0].label}</span>
        </summary>
        <ol>
          {RAIL_STOPS.map((s) => (
            <li key={s.id}>
              <a href={`#${s.anchor}`} data-rail-chip={s.id}>
                {s.label}
              </a>
            </li>
          ))}
        </ol>
      </details>
    </nav>
  );
}
