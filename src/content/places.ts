import { CONTACT } from "@/constants/strings.constants";
import { PROJECTS } from "@/constants/projects.constants";
import { appsOn } from "@/content/services";
import type { Place, PlaceId } from "@/content/types";
import type { Project } from "@/types/project.types";

const project = (name: string): Project => {
  const found = PROJECTS.find((p) => p.name === name);
  if (!found) throw new Error(`places: no project named "${name}" in projects.constants.ts`);
  return found;
};

/**
 * Project copy, links and screenshots come from projects.constants.ts, the one
 * place they are already kept honest; the town only adds where and how it shows.
 */
const fromProject = (p: Project) => ({
  name: p.name,
  desc: p.desc,
  stats: p.stats ?? [],
  stack: [
    ...p.techStack.languages,
    ...p.techStack.frontend,
    ...p.techStack.backend,
    ...p.techStack.infra,
  ] as string[],
  image: { src: p.src, srcSetWebp: p.srcSetWebp ?? "" },
  preLaunch: p.status === "pre-launch" || undefined,
  primary: { label: p.previewLabel ?? "Open site", href: p.urlPreview },
  secondary: p.repoUrl ? { label: "Source", href: p.repoUrl } : undefined,
  closedNote: p.closedSource,
});

const vpsApps = appsOn("vps").length;
const vercelSites = appsOn("vercel").length;

/** In cycle order: Next and the arrow keys walk this list. */
export const PLACES: Place[] = [
  {
    id: "hq",
    slug: "about",
    zone: "centre",
    name: "Headquarters",
    label: "HQ",
    kind: "About",
    pill: "You are here",
    color: "#f97316",
    desc: "Hugo García, full-stack engineer in Barcelona. TypeScript end to end: React and Next.js in the browser, Node.js and NestJS on the server, PostgreSQL underneath.",
    stats: ["Barcelona · remote", "EU & US hours", "Roles + freelance"],
    stack: ["TypeScript", "React", "Next.js", "Node.js", "NestJS", "PostgreSQL"],
    primary: { label: "Read the brief", action: "brief" },
    secondary: { label: "GitHub", href: CONTACT.GITHUB },
    map: { x: -3, z: -3.2, r: 2.2, top: 3.9, zoom: 12 },
  },
  {
    id: "f1",
    slug: "f1-tracker",
    zone: "outskirts",
    kind: "Service",
    pill: "Live",
    color: "#e5484d",
    ...fromProject(project("F1 Tracker")),
    map: { x: -11, z: -8.6, r: 5.3, top: 1.6, zoom: 18 },
  },
  {
    id: "rl",
    slug: "readledger",
    zone: "centre",
    kind: "Service",
    pill: "Live",
    color: "#2f9e8f",
    ...fromProject(project("ReadLedger")),
    map: { x: 3.4, z: -3.4, r: 2.5, top: 3.9, zoom: 14 },
  },
  {
    id: "wt",
    slug: "wrapped-things",
    zone: "centre",
    kind: "App",
    pill: "Pre-launch",
    color: "#7c5cff",
    ...fromProject(project("Wrapped Things")),
    map: { x: -3.2, z: 3.6, r: 2.3, top: 3.6, zoom: 13 },
  },
  {
    id: "es",
    slug: "esto-no-es-un-restaurante",
    zone: "seafront",
    kind: "App",
    pill: "Live",
    color: "#e0a526",
    ...fromProject(project("Esto no es un restaurante")),
    map: { x: 5.5, z: 11, r: 2.3, top: 3.0, zoom: 13 },
  },
  {
    id: "av",
    slug: "avatar-generator",
    zone: "industrial",
    kind: "Library",
    pill: "Live",
    color: "#3e63dd",
    ...fromProject(project("@avatar-generator")),
    map: { x: 4.4, z: -9.4, r: 2.4, top: 3.0, zoom: 13 },
  },
  {
    id: "yard",
    slug: "server-yard",
    zone: "industrial",
    name: "Server Yard",
    kind: "Infrastructure",
    pill: "All systems up",
    color: "#475569",
    desc: "Where the projects run. The VPS rack serves F1 Tracker's API, ReadLedger and Esto no es un restaurante (Docker, Caddy, Postgres). The Vercel rack serves this site, F1's frontend, Wrapped Things and the avatar docs. Requests in your accent colour come in, green responses go back.",
    stats: [
      `VPS: ${vpsApps} apps`,
      `Vercel: ${vercelSites} sites`,
      "Requests: accent",
      "Responses: green",
    ],
    stack: ["Docker", "Caddy", "PostgreSQL", "GitHub Actions", "Linux"],
    primary: { label: "Watch the traffic", action: "overview" },
    map: { x: -3.2, z: -9.4, r: 2.6, top: 2.6, zoom: 13 },
  },
  {
    id: "stadium",
    slug: "stadium",
    zone: "outskirts",
    name: "The Stadium",
    kind: "Football",
    pill: "Verdiblanco",
    color: "#00954c",
    desc: "Green and white stands for the club I follow. The floodlights come on when it is night in Barcelona.",
    stats: ["Football", "Floodlights at night"],
    stack: [],
    primary: { label: "Start a wave", action: "wave" },
    map: { x: 13.2, z: -8.4, r: 4, top: 3.4, zoom: 16 },
  },
  {
    id: "arena",
    slug: "arena",
    zone: "outskirts",
    name: "The Arena",
    kind: "Rocket League",
    pill: "Playable",
    color: "#2d6cdf",
    desc: "The game I keep coming back to. Take the wheel and put the ball in a goal.",
    stats: ["WASD or drag to steer", "Space to boost"],
    stack: [],
    primary: { label: "Take the wheel", action: "drive" },
    map: { x: -11, z: 11, r: 3.4, top: 2, zoom: 13 },
  },
  {
    id: "board",
    slug: "departures",
    zone: "seafront",
    name: "Departures",
    kind: "Where I work",
    pill: "Boarding",
    color: "#f59e0b",
    desc: "Barcelona-based, working remotely. Open to teams in Germany, Luxembourg, Switzerland and the US, full-time or freelance.",
    stats: ["EU & US hours", "Remote", "Freelance"],
    stack: [],
    primary: { label: "LinkedIn", href: CONTACT.LINKEDIN },
    map: { x: 15.8, z: 10.8, r: 1.5, top: 2.3, zoom: 11 },
  },
  {
    id: "post",
    slug: "contact",
    zone: "centre",
    name: "Post Office",
    kind: "Contact",
    pill: "Open",
    color: "#3b82c4",
    desc: `Say hello: ${CONTACT.EMAIL}. Or find me on GitHub and LinkedIn.`,
    stats: [CONTACT.EMAIL, "GitHub", "LinkedIn"],
    stack: [],
    primary: { label: "Copy email", action: "copyEmail" },
    secondary: { label: "LinkedIn", href: CONTACT.LINKEDIN },
    tertiary: { label: "GitHub", href: CONTACT.GITHUB },
    map: { x: 3.5, z: 3.6, r: 2.1, top: 3.9, zoom: 12 },
  },
];

export const ORDER: PlaceId[] = PLACES.map((p) => p.id);

export const PLACE_BY_ID = Object.fromEntries(PLACES.map((p) => [p.id, p])) as Record<
  PlaceId,
  Place
>;

export const PROJECT_IDS = ["f1", "rl", "wt", "es", "av"] as const;
export const PROJECT_PLACES: Place[] = PROJECT_IDS.map((id) => PLACE_BY_ID[id]);

/** Accepts "readledger", "#readledger" or any casing; "" and unknown slugs give undefined. */
export const placeBySlug = (slug: string): Place | undefined => {
  const wanted = slug.replace(/^#/, "").toLowerCase();
  if (!wanted) return undefined;
  return PLACES.find((p) => p.slug === wanted);
};
