import { TECH_GROUPS } from "@/constants/icons.constants";

export function BriefStack() {
  return (
    <section id="stack" aria-labelledby="stack-title" className="section-container py-14 space-y-6">
      <h2 id="stack-title">Stack</h2>
      <dl className="grid gap-6 sm:grid-cols-2">
        {TECH_GROUPS.map((group) => (
          <div key={group.label} className="space-y-2">
            <dt className="text-sm font-semibold text-text">{group.label}</dt>
            <dd className="text-muted">{group.icons.map((icon) => icon.name).join(" · ")}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
