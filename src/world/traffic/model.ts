import type { Tier } from "@/boot/tiers";
import type { StatusMap } from "@/store/store";

type Cell = [number, number];
const key = (c: Cell) => `${c[0]},${c[1]}`;

/** Road grid (reference 667-669): the main road, the avenue and the promenade. */
export const ROAD_CELLS = (() => {
  const cells = new Set<string>();
  for (let x = -17; x <= 17; x++) cells.add(key([x, 0]));
  for (let z = -13; z <= 7; z++) cells.add(key([0, z]));
  for (let x = -17; x <= 17; x++) cells.add(key([x, 7]));
  return cells;
})();

export const bfs = (a: Cell, b: Cell): Cell[] => {
  const prev = new Map<string, Cell | null>([[key(a), null]]);
  const queue: Cell[] = [a];
  while (queue.length) {
    const c = queue.shift()!;
    if (c[0] === b[0] && c[1] === b[1]) break;
    for (const [dx, dz] of [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ] as const) {
      const n: Cell = [c[0] + dx, c[1] + dz];
      if (ROAD_CELLS.has(key(n)) && !prev.has(key(n))) {
        prev.set(key(n), c);
        queue.push(n);
      }
    }
  }
  const path: Cell[] = [];
  for (let c: Cell | null | undefined = b; c; c = prev.get(key(c))) path.unshift(c);
  return path;
};

/** Where each app's traffic joins the road (reference DOORS, line 673). */
export const DOORS = {
  hq: [-3, 0],
  f1: [-11, 0],
  rl: [3, 0],
  wt: [0, 4],
  es: [5, 7],
  av: [0, -8],
} satisfies Record<string, Cell>;
export type TrafficApp = keyof typeof DOORS;

/** The avenue cell beside the yard where packets turn in. */
export const YARD_GATE: Cell = [0, -10];
/** Between the two rack rows inside the yard (yard at -3.2, -9.4). */
export const YARD_TARGET: Cell = [-1.9, -9.4];

export interface Route {
  id: TrafficApp;
  path: Cell[];
}

export const buildRoutes = (): Route[] =>
  (Object.keys(DOORS) as TrafficApp[]).map((id) => ({
    id,
    path: [...bfs(DOORS[id], YARD_GATE), YARD_TARGET],
  }));

/** One lane per road edge any route uses, towards the yard (excludes the final hop into the yard). */
export const laneEdges = (routes: Route[]) => {
  const edges = new Map<string, [Cell, Cell]>();
  for (const r of routes) {
    for (let i = 0; i < r.path.length - 2; i++) {
      const a = r.path[i];
      const b = r.path[i + 1];
      edges.set(`${key(a)}>${key(b)}`, [a, b]);
    }
  }
  return [...edges.values()];
};

/** Distance from the road's centre line to the packets' lane. */
export const LANE = 0.22;

/** A point `s` cells along a path, on the right-hand lane, with its heading (reference `at`). */
export const pointAt = (
  path: Cell[],
  sIn: number,
  out: { x: number; z: number; ry: number } = { x: 0, z: 0, ry: 0 },
) => {
  const n = path.length - 1;
  const s = Math.min(Math.max(sIn, 0), n - 1e-4);
  const i = Math.floor(s);
  const t = s - i;
  const [a, b] = [path[i], path[i + 1]];
  const dx = b[0] - a[0];
  const dz = b[1] - a[1];
  const len = Math.hypot(dx, dz) || 1;
  out.x = a[0] + dx * t - (dz / len) * LANE;
  out.z = a[1] + dz * t + (dx / len) * LANE;
  out.ry = Math.atan2(-dz, dx);
  return out;
};

export interface StreakPoint {
  x: number;
  z: number;
  /** Heading, filled by pointAt for the tail and head; unused by the corners. */
  ry: number;
  /** 0 at the streak's tail, 1 at its head: where this point sits along the fade. */
  u: number;
}

/**
 * The lane-side points a streak from `s0` to `s1` passes through: its tail, a
 * mitred point at every corner in between, and its head. Drawing a piece
 * between each pair bends the streak round a corner instead of cutting the
 * diagonal. Writes into `out` (reused, no allocation) and returns the count.
 */
export const streakPoints = (path: Cell[], s0: number, s1: number, out: StreakPoint[]) => {
  const span = s1 - s0 || 1;
  let n = 0;
  pointAt(path, s0, out[n]);
  out[n++].u = 0;
  for (let i = Math.floor(s0) + 1; i < s1 && i < path.length - 1 && n < out.length - 1; i++) {
    const [px, pz] = path[i - 1];
    const [cx, cz] = path[i];
    const [nx, nz] = path[i + 1];
    const l1 = Math.hypot(cx - px, cz - pz) || 1;
    const l2 = Math.hypot(nx - cx, nz - cz) || 1;
    // Lane normals either side of the corner (the same side pointAt offsets to).
    const ax = -(cz - pz) / l1;
    const az = (cx - px) / l1;
    const bx = -(nz - cz) / l2;
    const bz = (nx - cx) / l2;
    const dot = ax * bx + az * bz;
    if (dot > 0.999) continue; // straight on: no corner to bend round
    // The mitre: where the two offset lane lines meet.
    const k = LANE / (1 + dot);
    const p = out[n++];
    p.x = cx + (ax + bx) * k;
    p.z = cz + (az + bz) * k;
    p.u = (i - s0) / span;
  }
  pointAt(path, s1, out[n]);
  out[n++].u = 1;
  return n;
};

/**
 * Simulated traffic (spec 6b, revised 6 Oct): a fixed, plausible profile per
 * app. These numbers only shape the animation; none is ever shown on screen.
 */
export const PROFILES: Record<TrafficApp, { rpm: number; p50: number }> = {
  hq: { rpm: 40, p50: 60 },
  f1: { rpm: 30, p50: 140 },
  rl: { rpm: 12, p50: 80 },
  wt: { rpm: 6, p50: 50 },
  es: { rpm: 8, p50: 90 },
  av: { rpm: 4, p50: 40 },
};

/** Flows per second, log-scaled from requests per minute and capped so the roads stay calm. */
export const requestsPerSecond = (rpm: number) =>
  Math.min(1, Math.log10(1 + Math.max(0, rpm)) * 0.25);

/** Cells per second: slower apps move visibly slower, clamped to stay readable. */
export const packetSpeed = (p50: number) =>
  Math.min(3, Math.max(1.2, 3.2 - Math.log10(1 + Math.max(0, p50)) * 0.6));

export interface RoutePlan {
  route: Route;
  rate: number;
  speed: number;
  down: boolean;
}

/** One plan per route, same order: the app's profile, and whether status reports it down. */
export const planRoutes = (routes: Route[], status: StatusMap | "unknown"): RoutePlan[] =>
  routes.map((route) => ({
    route,
    rate: requestsPerSecond(PROFILES[route.id].rpm),
    speed: packetSpeed(PROFILES[route.id].p50),
    down: status !== "unknown" && status[route.id]?.ok === false,
  }));

export const CAPS: Record<Tier, { req: number; res: number }> = {
  0: { req: 0, res: 0 },
  1: { req: 4, res: 2 },
  2: { req: 8, res: 4 },
  3: { req: 8, res: 4 },
};
