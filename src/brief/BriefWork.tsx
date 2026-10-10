import { PROJECT_PLACES } from "@/content/places";

export function BriefWork() {
  return (
    <section id="work" aria-labelledby="work-title" className="section-container py-14 space-y-8">
      <h2 id="work-title">Work</h2>
      <div className="grid gap-8 md:grid-cols-2">
        {PROJECT_PLACES.map((place) => (
          <article key={place.id} id={place.slug} className="brief-card flex flex-col min-w-0">
            {place.image && (
              <picture>
                <source
                  type="image/webp"
                  srcSet={place.image.srcSetWebp}
                  sizes="(min-width: 768px) 560px, 100vw"
                />
                <img
                  src={place.image.src}
                  alt={`Screenshot of ${place.name}`}
                  width={1280}
                  height={800}
                  loading="lazy"
                  decoding="async"
                  className="w-full aspect-[16/10] object-cover object-top border-b border-border"
                />
              </picture>
            )}
            <div className="flex flex-1 flex-col gap-4 p-6">
              <h3 className="flex flex-wrap items-center gap-3 break-words">
                {place.name}
                {place.preLaunch && (
                  <span className="rounded-full border border-border px-2.5 py-0.5 text-xs font-semibold text-muted">
                    pre-launch
                  </span>
                )}
              </h3>
              <p className="text-muted leading-relaxed">{place.desc}</p>
              {place.stats.length > 0 && (
                <ul className="flex flex-wrap gap-2">
                  {place.stats.map((stat) => (
                    <li
                      key={stat}
                      className="rounded-md border border-border bg-background px-2 py-1 text-xs font-medium text-muted"
                    >
                      {stat}
                    </li>
                  ))}
                </ul>
              )}
              <p className="text-xs font-medium text-muted">{place.stack.join(" · ")}</p>
              <div className="mt-auto flex flex-wrap items-center gap-3 pt-2">
                {place.primary.href && (
                  <a
                    className="btn-primary"
                    href={place.primary.href}
                    target="_blank"
                    rel="noopener"
                  >
                    {place.primary.label}
                  </a>
                )}
                {place.secondary ? (
                  <a
                    className="btn-primary"
                    href={place.secondary.href}
                    target="_blank"
                    rel="noopener"
                  >
                    {place.secondary.label}
                  </a>
                ) : (
                  place.closedNote && (
                    <span className="text-xs font-medium text-muted">{place.closedNote}</span>
                  )
                )}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
