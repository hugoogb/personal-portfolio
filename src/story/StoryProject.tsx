import { STOPS } from "@/content/tour";
import type { Place } from "@/content/types";

export function StoryProject({ place }: { place: Place }) {
  const stop = STOPS.find((s) => s.place === place.id)!;
  return (
    <section
      id={place.slug}
      data-stop={stop.id}
      data-side={stop.side}
      className="story-stop"
      aria-labelledby={`${place.slug}-title`}
    >
      <article className="story-card">
        {place.image && (
          <picture>
            <source
              type="image/webp"
              srcSet={place.image.srcSetWebp}
              sizes="(min-width: 768px) 480px, 100vw"
            />
            <img
              src={place.image.src}
              alt={`Screenshot of ${place.name}`}
              width={1280}
              height={800}
              loading="lazy"
              decoding="async"
              className="story-shot"
            />
          </picture>
        )}
        <h2 id={`${place.slug}-title`} className="story-card__title">
          {place.name}
          {place.preLaunch && <span className="story-badge">pre-launch</span>}
          <span className="story-status" data-status-for={place.id} hidden />
        </h2>
        <p className="story-text">{place.desc}</p>
        {place.stats.length > 0 && (
          <ul className="story-chips">
            {place.stats.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        )}
        <p className="story-stack">{place.stack.join(" · ")}</p>
        <div className="story-links">
          {place.primary.href && (
            <a
              className="story-btn story-btn--primary"
              href={place.primary.href}
              target="_blank"
              rel="noopener"
            >
              {place.primary.label}
            </a>
          )}
          {place.secondary ? (
            <a className="story-btn" href={place.secondary.href} target="_blank" rel="noopener">
              {place.secondary.label}
            </a>
          ) : (
            place.closedNote && <span className="story-note">{place.closedNote}</span>
          )}
        </div>
      </article>
    </section>
  );
}
