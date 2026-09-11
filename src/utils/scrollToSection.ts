/**
 * Scrolls a section into view by its DOM id.
 *
 * Shared by the navbar links and the home call-to-action buttons so every
 * in-page jump behaves identically. The page scrolls inside `<main>` rather
 * than the window, which `scrollIntoView` handles on its own.
 */
export function scrollToSection(sectionId: string): void {
  document.getElementById(sectionId)?.scrollIntoView({
    behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
    block: "start",
  });
}
