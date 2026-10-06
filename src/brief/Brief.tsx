import { BriefContact } from "@/brief/BriefContact";
import { BriefIntro } from "@/brief/BriefIntro";
import { BriefStack } from "@/brief/BriefStack";
import { BriefWork } from "@/brief/BriefWork";

/**
 * The plain one-pager. It is the prerendered HTML: crawlers, link previews,
 * screen readers and Lite devices get exactly this, and from Phase 2 the town
 * mounts over it for everyone else. It is static and never hydrated, so it has
 * no handlers: every interaction is a plain link.
 */
export function Brief() {
  return (
    <main id="brief">
      <BriefIntro />
      <BriefWork />
      <BriefStack />
      <BriefContact />
      <footer className="section-container py-10 text-sm text-muted">
        hugoogb.dev · Barcelona
      </footer>
    </main>
  );
}
