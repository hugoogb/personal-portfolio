import { useState } from "react";
import { stepPlace } from "@/content/places";
import type { Place } from "@/content/types";
import { runPrimary } from "@/hud/actions";
import { pillFor } from "@/hud/pill";
import { useBaseCamp } from "@/store/store";

/**
 * The selection card (spec 4.3): screenshot banner for projects, then the
 * facts, then Q W E R. Links are real anchors (tracked by ClientRoot); the
 * primary button sizes to its label and wraps to its own row on narrow cards.
 */
export function PlaceCard({ place }: { place: Place }) {
  const status = useBaseCamp((s) => s.status);
  const stackOpen = useBaseCamp((s) => s.stackOpen);
  const toggleStack = useBaseCamp((s) => s.toggleStack);
  const select = useBaseCamp((s) => s.select);
  const [details, setDetails] = useState(false);
  const pill = pillFor(place, status);

  return (
    <section
      className="card glass"
      aria-live="polite"
      aria-label={`${place.name}, ${place.kind}`}
      data-details={details}
    >
      {place.image && (
        <picture className="card__banner">
          <source type="image/webp" srcSet={place.image.srcSetWebp} sizes="420px" />
          <img
            src={place.image.src}
            alt={`Screenshot of ${place.name}`}
            loading="lazy"
            decoding="async"
          />
        </picture>
      )}
      <div className="card__head">
        <span className="card__thumb" style={{ background: place.color }} aria-hidden="true" />
        <div className="card__titles">
          <p className="card__kind hud-label">{place.kind}</p>
          <h2 className="card__name">{place.name}</h2>
        </div>
        <span className={`pill pill--${pill.tone}`}>{pill.text}</span>
      </div>
      <div className="card__body">
        <p className="card__desc">{place.desc}</p>
        {place.stats.length > 0 && (
          <ul className="chips">
            {place.stats.map((stat) => (
              <li key={stat} className="chip">
                {stat}
              </li>
            ))}
          </ul>
        )}
        {stackOpen && place.stack.length > 0 && (
          <ul className="chips chips--stack" aria-label="Stack">
            {place.stack.map((tech) => (
              <li key={tech} className="chip">
                {tech}
              </li>
            ))}
          </ul>
        )}
      </div>
      <button
        type="button"
        className="card__details hud-btn"
        aria-expanded={details}
        onClick={() => setDetails((d) => !d)}
      >
        {details ? "Less" : "Details"}
      </button>
      <div className="card__cmds">
        {place.primary.href ? (
          <a
            className="cmd cmd--primary"
            href={place.primary.href}
            target="_blank"
            rel="noopener"
            data-track={place.name}
          >
            <kbd>Q</kbd>
            <span>{place.primary.label}</span>
          </a>
        ) : (
          <button type="button" className="cmd cmd--primary" onClick={() => runPrimary(place)}>
            <kbd>Q</kbd>
            <span>{place.primary.label}</span>
          </button>
        )}
        {place.secondary ? (
          <a
            className="cmd"
            href={place.secondary.href}
            target="_blank"
            rel="noopener"
            data-track={`${place.name} ${place.secondary.label}`}
          >
            <kbd>W</kbd>
            <span>{place.secondary.label}</span>
          </a>
        ) : (
          <button type="button" className="cmd" disabled title="Closed source">
            <kbd>W</kbd>
            <span>Private</span>
          </button>
        )}
        {place.stack.length > 0 ? (
          <button type="button" className="cmd" aria-pressed={stackOpen} onClick={toggleStack}>
            <kbd>E</kbd>
            <span>Stack</span>
          </button>
        ) : place.tertiary ? (
          <a
            className="cmd"
            href={place.tertiary.href}
            target="_blank"
            rel="noopener"
            data-track={`${place.name} ${place.tertiary.label}`}
          >
            <kbd>E</kbd>
            <span>{place.tertiary.label}</span>
          </a>
        ) : (
          <button type="button" className="cmd" disabled>
            <kbd>E</kbd>
            <span>Stack</span>
          </button>
        )}
        <button type="button" className="cmd" onClick={() => select(stepPlace(place.id, 1))}>
          <kbd>R</kbd>
          <span>Next</span>
        </button>
      </div>
    </section>
  );
}
