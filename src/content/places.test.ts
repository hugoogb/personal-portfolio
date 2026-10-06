import { describe, expect, it } from "vitest";
import {
  ORDER,
  PLACES,
  PLACE_BY_ID,
  PROJECT_IDS,
  PROJECT_PLACES,
  placeBySlug,
} from "@/content/places";
import type { Place } from "@/content/types";

const ISLAND = { hx: 18, hz: 14 };

const copyOf = (p: Place) => [
  p.name,
  p.label ?? "",
  p.kind,
  p.pill,
  p.desc,
  ...p.stats,
  p.primary.label,
  p.secondary?.label ?? "",
  p.tertiary?.label ?? "",
  p.closedNote ?? "",
];

const linksOf = (p: Place) =>
  [p.primary.href, p.secondary?.href, p.tertiary?.href].filter(Boolean) as string[];

describe("places", () => {
  it("lists the eleven places in cycle order", () => {
    expect(ORDER).toEqual([
      "hq",
      "f1",
      "rl",
      "wt",
      "es",
      "av",
      "yard",
      "stadium",
      "arena",
      "board",
      "post",
    ]);
    expect(PLACES.map((p) => p.id)).toEqual(ORDER);
  });

  it("gives every place a unique slug", () => {
    expect(new Set(PLACES.map((p) => p.slug)).size).toBe(PLACES.length);
  });

  it("gives every place exactly one primary target", () => {
    for (const p of PLACES)
      expect(Boolean(p.primary.href) !== Boolean(p.primary.action)).toBe(true);
  });

  it("links only to https", () => {
    for (const p of PLACES) for (const href of linksOf(p)) expect(href).toMatch(/^https:\/\//);
  });

  it("keeps copy free of em and en dashes", () => {
    for (const p of PLACES)
      for (const text of copyOf(p)) expect(text).not.toMatch(/[\u2013\u2014]/);
  });

  it("shows a screenshot for every project and for nothing else", () => {
    for (const p of PLACES) {
      expect(Boolean(p.image)).toBe(PROJECT_IDS.includes(p.id as (typeof PROJECT_IDS)[number]));
    }
    for (const p of PROJECT_PLACES) {
      expect(p.image?.src).toBeTruthy();
      expect(p.image?.srcSetWebp).toMatch(/640w.*1280w/);
    }
  });

  it("keeps every place on the island", () => {
    for (const p of PLACES) {
      expect(Math.abs(p.map.x)).toBeLessThan(ISLAND.hx);
      expect(Math.abs(p.map.z)).toBeLessThan(ISLAND.hz);
    }
  });

  it("resolves deep-link slugs, including the old section names", () => {
    expect(placeBySlug("readledger")?.id).toBe("rl");
    expect(placeBySlug("ReadLedger")?.id).toBe("rl");
    expect(placeBySlug("#f1-tracker")?.id).toBe("f1");
    expect(placeBySlug("about")?.id).toBe("hq");
    expect(placeBySlug("contact")?.id).toBe("post");
    expect(placeBySlug("work")).toBeUndefined();
    expect(placeBySlug("")).toBeUndefined();
  });

  it("puts the hello@ address on the post office", () => {
    expect(PLACE_BY_ID.post.desc).toContain("hello@hugoogb.dev");
    expect(PLACE_BY_ID.post.stats).toContain("hello@hugoogb.dev");
    expect(PLACE_BY_ID.post.tertiary).toEqual({
      label: "GitHub",
      href: "https://github.com/hugoogb",
    });
  });

  it("derives the server yard's counts from the hosting map", () => {
    expect(PLACE_BY_ID.yard.stats).toContain("VPS: 3 apps");
    expect(PLACE_BY_ID.yard.stats).toContain("Vercel: 4 sites");
  });

  it("takes project copy and links from the project constants", () => {
    expect(PLACE_BY_ID.f1.primary).toEqual({
      label: "Open site",
      href: "https://f1-tracker.hugoogb.dev",
    });
    expect(PLACE_BY_ID.wt.preLaunch).toBe(true);
    expect(PLACE_BY_ID.wt.secondary).toBeUndefined();
    expect(PLACE_BY_ID.wt.closedNote).toBe("Pre-launch · closed source");
    expect(PLACE_BY_ID.rl.secondary?.href).toBe("https://github.com/hugoogb/readledger");
  });
});
