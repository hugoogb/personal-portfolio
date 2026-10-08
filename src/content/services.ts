import type { Host, PlaceId } from "@/content/types";

export interface Service {
  id: PlaceId;
  /** Hostname a visitor opens; also what /api/status probes. */
  host: string;
  hostedOn: Host[];
}

/**
 * Where each project really runs, verified on 2026-10-06 from DNS and the deploy
 * workflows. The server yard draws a rack row per host and routes traffic from
 * these alone, so a project moving host is a one-line change here.
 *
 * F1 Tracker is on both: its frontend is on Vercel and its API on the VPS.
 *
 * This file imports types only. api/status.ts imports it, and must not pull in
 * places.ts and its image imports.
 */
export const SERVICES: Service[] = [
  { id: "hq", host: "hugoogb.dev", hostedOn: ["vercel"] },
  { id: "f1", host: "f1-tracker.hugoogb.dev", hostedOn: ["vercel", "vps"] },
  { id: "rl", host: "readledger.app", hostedOn: ["vps"] },
  { id: "wt", host: "wrappedthings.app", hostedOn: ["vercel"] },
  { id: "es", host: "estonoesunrestaurante.com", hostedOn: ["vps"] },
  { id: "av", host: "avatar-generator.hugoogb.dev", hostedOn: ["vercel"] },
];

/** This site is never probed: if it were down, nobody would be reading the answer. */
export const STATUS_TARGETS = SERVICES.filter((s) => s.id !== "hq").map((s) => ({
  id: s.id,
  host: s.host,
  url: `https://${s.host}`,
}));

export const appsOn = (host: Host): PlaceId[] =>
  SERVICES.filter((s) => s.hostedOn.includes(host)).map((s) => s.id);
