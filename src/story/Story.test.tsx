// @vitest-environment jsdom
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { RAIL_STOPS, STOPS } from "@/content/tour";
import { PROJECT_PLACES } from "@/content/places";
import { CONTACT } from "@/constants/strings.constants";
import { Story } from "@/story/Story";

describe("Story", () => {
  it("renders one section per stop, in tour order, with the anchors and stop ids", () => {
    const { container } = render(<Story />);
    const sections = [...container.querySelectorAll("main#story > section")];
    expect(sections.map((s) => [s.id, s.getAttribute("data-stop")])).toEqual(
      STOPS.map((s) => [s.anchor, s.id]),
    );
  });

  it("has one h1 with the name and no tagline", () => {
    const { container } = render(<Story />);
    expect([...container.querySelectorAll("h1")].map((h) => h.textContent)).toEqual([
      "Hugo García Benjumea",
    ]);
    expect(container.textContent).not.toMatch(/Open to remote roles & freelance/);
  });

  it("shows every project with its links, and the stack inside About", () => {
    const { getByRole, container } = render(<Story />);
    for (const p of PROJECT_PLACES) {
      expect(getByRole("heading", { level: 2, name: new RegExp(p.name) })).toBeTruthy();
      if (p.primary.href)
        expect(container.querySelector(`a[href="${p.primary.href}"]`)).toBeTruthy();
    }
    expect(container.querySelector("#about")!.textContent).toMatch(/TypeScript/);
    expect(container.querySelector("#stack")).toBeNull();
  });

  it("lists the rail stops as anchor links", () => {
    const { container } = render(<Story />);
    const links = [...container.querySelectorAll("#rail a[data-rail]")];
    expect(links.map((a) => a.getAttribute("href"))).toEqual(RAIL_STOPS.map((s) => `#${s.anchor}`));
  });

  it("keeps the email as a mailto link in Contact", () => {
    const { container } = render(<Story />);
    expect(container.querySelector(`#contact a[href="mailto:${CONTACT.EMAIL}"]`)).toBeTruthy();
  });

  it("puts the backdrop before the document, hidden from assistive tech", () => {
    const { container } = render(<Story />);
    const backdrop = container.querySelector("#backdrop")!;
    expect(backdrop.getAttribute("aria-hidden")).toBe("true");
    expect(backdrop.compareDocumentPosition(container.querySelector("main#story")!)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
  });
});
