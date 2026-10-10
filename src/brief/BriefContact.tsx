import { CONTACT } from "@/constants/strings.constants";

const LINKS = [
  { label: "github.com/hugoogb", href: CONTACT.GITHUB },
  { label: "linkedin.com/in/hugoogb", href: CONTACT.LINKEDIN },
] as const;

export function BriefContact() {
  return (
    <section
      id="contact"
      aria-labelledby="contact-title"
      className="section-container py-14 space-y-6"
    >
      <h2 id="contact-title">Get in touch</h2>
      <p className="max-w-2xl text-muted leading-relaxed">
        I'm open to remote roles and freelance projects, and I work across EU and US hours. Email is
        the fastest way to reach me - I read everything and I answer.
      </p>
      <p>
        <a
          className="font-display text-2xl sm:text-3xl font-black tracking-tight text-text underline decoration-primary underline-offset-8 break-all"
          href={`mailto:${CONTACT.EMAIL}`}
        >
          {CONTACT.EMAIL}
        </a>
      </p>
      <ul className="flex flex-wrap gap-3">
        {LINKS.map((link) => (
          <li key={link.href}>
            <a className="btn-primary" href={link.href} target="_blank" rel="noopener">
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
