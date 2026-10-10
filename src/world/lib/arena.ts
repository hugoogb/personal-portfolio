export const AX = 2.3;
export const AZ = 1.6;
export const GOAL_MOUTH = 0.55;
/** Kick-off: the car waits on its own half, facing the ball at the centre spot. */
export const CAR_START = { x: -1.3, y: 0 } as const;

export interface ArenaState {
  /** Car position in arena space (x, and y = arena z). */
  cp: { x: number; y: number };
  th: number;
  v: number;
  ball: { x: number; z: number };
  bv: { x: number; y: number };
  /** Seconds left of the post-goal pause; the ball is hidden while > 0. */
  lock: number;
}
export interface DriveInput {
  throttle: number;
  steer: number;
  boost: boolean;
  /** Touch: steer towards this arena-space point. */
  steerTo: { x: number; z: number } | null;
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

export const createArena = (): ArenaState => ({
  cp: { ...CAR_START },
  th: 0,
  v: 0,
  ball: { x: 0, z: 0 },
  bv: { x: 0, y: 0 },
  lock: 0,
});

/** One physics step (reference updateArena, lines 1504-1529). */
export function stepArena(
  a: ArenaState,
  input: DriveInput,
  dt: number,
): { goal: "Blue" | "Orange" | null } {
  let thr = input.throttle;
  let str = input.steer;
  if (input.steerTo) {
    const dx = input.steerTo.x - a.cp.x;
    const dz = input.steerTo.z - a.cp.y;
    const want = Math.atan2(-dz, dx);
    let df = want - a.th;
    df = Math.atan2(Math.sin(df), Math.cos(df));
    str = clamp(df * 2.2, -1, 1);
    thr = Math.hypot(dx, dz) > 0.35 ? 1 : 0;
  }
  const boost = input.boost;
  a.v += thr * (boost ? 13 : 8) * dt;
  a.v *= Math.exp(-1.9 * dt);
  a.v = clamp(a.v, -3, boost ? 6.5 : 4.6);
  a.th += str * 2.9 * dt * clamp(a.v / 2.2, -1, 1);
  const hx = Math.cos(a.th);
  const hz = -Math.sin(a.th);
  a.cp.x += hx * a.v * dt;
  a.cp.y += hz * a.v * dt;
  if (Math.abs(a.cp.x) > AX - 0.36) {
    a.cp.x = Math.sign(a.cp.x) * (AX - 0.36);
    a.v *= -0.3;
  }
  if (Math.abs(a.cp.y) > AZ - 0.3) {
    a.cp.y = Math.sign(a.cp.y) * (AZ - 0.3);
    a.v *= -0.3;
  }

  if (a.lock > 0) {
    a.lock -= dt;
    if (a.lock <= 0) {
      a.ball = { x: 0, z: 0 };
      a.bv = { x: 0, y: 0 };
      a.cp = { ...CAR_START };
      a.th = 0;
      a.v = 0;
    }
    return { goal: null };
  }

  const damp = Math.exp(-0.85 * dt);
  a.bv.x *= damp;
  a.bv.y *= damp;
  let bx = a.ball.x + a.bv.x * dt;
  let bz = a.ball.z + a.bv.y * dt;
  const dx = bx - a.cp.x;
  const dz = bz - a.cp.y;
  const d = Math.hypot(dx, dz);
  if (d < 0.62 && d > 0) {
    const nx = dx / d;
    const nz = dz / d;
    bx = a.cp.x + nx * 0.62;
    bz = a.cp.y + nz * 0.62;
    const rel = hx * a.v * nx + hz * a.v * nz;
    a.bv.x += nx * (Math.max(0, rel) * 1.25 + 0.9);
    a.bv.y += nz * (Math.max(0, rel) * 1.25 + 0.9);
  }
  if (Math.abs(bz) > AZ - 0.3) {
    bz = Math.sign(bz) * (AZ - 0.3);
    a.bv.y *= -0.8;
  }
  if (Math.abs(bx) > AX - 0.3) {
    if (Math.abs(bz) < GOAL_MOUTH) {
      if (Math.abs(bx) > AX + 0.2) {
        a.lock = 1.1;
        a.ball = { x: bx, z: bz };
        return { goal: bx > 0 ? "Blue" : "Orange" };
      }
    } else {
      bx = Math.sign(bx) * (AX - 0.3);
      a.bv.x *= -0.8;
    }
  }
  a.ball = { x: bx, z: bz };
  return { goal: null };
}
