// @vitest-environment jsdom
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Brief } from "@/brief/Brief";
import { TitleCard } from "@/brief/TitleCard";
import { PROJECT_PLACES } from "@/content/places";

const render = (node: React.ReactNode) => {
  const host = document.createElement("div");
  host.innerHTML = renderToStaticMarkup(node);
  return host;
};

describe("Brief", () => {
  it("has exactly one h1, the full name", () => {
    const headings = render(<Brief />).querySelectorAll("h1");
    expect(headings).toHaveLength(1);
    expect(headings[0].textContent).toBe("Hugo García Benjumea");
  });

  it("keeps the section anchors today's links use", () => {
    const page = render(<Brief />);
    for (const id of ["about", "work", "stack", "contact"]) {
      expect(page.querySelector(`#${id}`), id).not.toBeNull();
    }
  });

  it("anchors every project by its slug, with its screenshot", () => {
    const page = render(<Brief />);
    for (const place of PROJECT_PLACES) {
      const article = page.querySelector(`article#${place.slug}`);
      expect(article, place.slug).not.toBeNull();
      const img = article?.querySelector("img");
      expect(img?.getAttribute("alt")).toBe(`Screenshot of ${place.name}`);
      expect(img?.getAttribute("loading")).toBe("lazy");
      expect(article?.querySelector("source")?.getAttribute("srcset")).toContain("1280w");
    }
  });

  it("links the hello@ address", () => {
    const mail = render(<Brief />).querySelector('a[href^="mailto:"]');
    expect(mail?.getAttribute("href")).toBe("mailto:hello@hugoogb.dev");
    expect(mail?.textContent).toBe("hello@hugoogb.dev");
  });

  it("opens external links in a new tab without the opener", () => {
    const external = render(<Brief />).querySelectorAll('a[target="_blank"]');
    expect(external.length).toBeGreaterThan(5);
    for (const link of external) expect(link.getAttribute("rel")).toContain("noopener");
  });

  it("tags outbound links for analytics", () => {
    const tagged = render(<Brief />).querySelectorAll("a[data-track]");
    expect(tagged.length).toBeGreaterThanOrEqual(PROJECT_PLACES.length);
  });
});

describe("TitleCard", () => {
  it("names the person and offers the brief", () => {
    const card = render(<TitleCard />);
    expect(card.querySelector("#title-card")?.textContent).toContain("Hugo García Benjumea");
    expect(card.querySelector("#title-card-progress")).not.toBeNull();
    expect(card.querySelector('a[href="#brief"]')).not.toBeNull();
  });
});
