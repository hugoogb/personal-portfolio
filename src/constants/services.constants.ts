export interface Service {
  /** Hostname or package scope, rendered in mono - it is a machine string. */
  host: string;
  meta: string;
  state: string;
  url?: string;
  /** Drives the dot colour: the accent for something serving traffic, muted otherwise. */
  running: boolean;
}

/**
 * What is currently out in the world, one row per project - each one a live
 * site a visitor can open, rather than a registry page about it.
 *
 * F1 Tracker is a single project whose frontend and API happen to live on
 * different hosts, so it gets one row - two would read as two projects.
 *
 * No version numbers here on purpose: they go stale the moment something is
 * released, and a stale version on a portfolio is worse than no version.
 *
 * The `state` strings here are the fallback, not the answer: /api/status probes
 * these hosts from the server and the panel shows real round trips instead. A
 * browser cannot do that check itself - the F1 API allows no origin at all, and
 * a preflight from this site returns 400 - which is exactly why it is a server
 * function and not a fetch from the page.
 */
export const SERVICES: Service[] = [
  {
    host: "f1-tracker.hugoogb.dev",
    meta: "Next.js on Vercel, API and Postgres on my VPS",
    state: "live",
    url: "https://f1-tracker.hugoogb.dev",
    running: true,
  },
  {
    host: "readledger.app",
    meta: "Next.js, Supabase, Prisma",
    state: "live",
    url: "https://readledger.app",
    running: true,
  },
  {
    host: "avatar-generator.hugoogb.dev",
    meta: "Docs and style gallery for the npm packages, built with Astro",
    state: "live",
    url: "https://avatar-generator.hugoogb.dev",
    running: true,
  },
];
