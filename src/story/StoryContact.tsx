import { CONTACT } from "@/constants/strings.constants";

const LINKS = [
  { label: "github.com/hugoogb", href: CONTACT.GITHUB },
  { label: "linkedin.com/in/hugoogb", href: CONTACT.LINKEDIN },
] as const;

export function StoryContact() {
  return (
    <section
      id="contact"
      data-stop="contact"
      data-side="left"
      className="story-stop"
      aria-labelledby="contact-title"
    >
      <div className="story-card">
        <h2 id="contact-title">Get in touch</h2>
        <p className="story-text">
          I'm open to remote roles and freelance projects, and I work across EU and US hours. Email
          is the fastest way to reach me - I read everything and I answer.
        </p>
        <p className="story-text">
          <a className="story-email" href={`mailto:${CONTACT.EMAIL}`}>
            {CONTACT.EMAIL}
          </a>
        </p>
        <ul className="story-links">
          {LINKS.map((link) => (
            <li key={link.href}>
              <a className="story-btn" href={link.href} target="_blank" rel="noopener">
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
