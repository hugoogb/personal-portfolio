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
 * What is currently out in the world, one row per project.
 *
 * F1 Tracker is a single project whose frontend and API happen to live on
 * different hosts, so it gets one row - two would read as two projects.
 *
 * No version numbers here on purpose: they go stale the moment something is
 * released, and a stale version on a portfolio is worse than no version.
 *
 * States are static. Reading them live would mean a cross-origin fetch, and the
 * F1 API currently allows no browser origin at all - a preflight from this site
 * returns 400.
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
    host: "@avatar-generator",
    meta: "Core, styles and framework renderers",
    state: "on npm",
    url: "https://www.npmjs.com/org/avatar-generator",
    running: false,
  },
];
