import { ISLAND } from "@/world/lib/map";

export const CAMERA_OFFSET = [54, 46.5, 54] as const;
export const VIEW_MIN = 7;

export const rigState = { x: 0, z: 0, view: 0, az: 0 };

export const VIEW_MAX = 40;
export const STORY_VIEW_MAX = 64;
export const NARROW_WIDTH = 760;

type V3 = [number, number, number];

const normalise = (v: V3): V3 => {
  const length = Math.hypot(v[0], v[1], v[2]);
  return [v[0] / length, v[1] / length, v[2] / length];
};
const cross = (a: V3, b: V3): V3 => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];

const FORWARD = normalise([-CAMERA_OFFSET[0], -CAMERA_OFFSET[1], -CAMERA_OFFSET[2]]);
const RIGHT = normalise(cross(FORWARD, [0, 1, 0]));
const UP = cross(RIGHT, FORWARD);

const toGround = (s: V3) => {
  const t = s[1] / FORWARD[1];
  return { x: s[0] - FORWARD[0] * t, z: s[2] - FORWARD[2] * t };
};

const screen = (right: number, up: number): V3 => [
  RIGHT[0] * right + UP[0] * up,
  RIGHT[1] * right + UP[1] * up,
  RIGHT[2] * right + UP[2] * up,
];

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

export const clampView = (view: number, max: number = VIEW_MAX) => clamp(view, VIEW_MIN, max);

export const clampTarget = (x: number, z: number) => ({
  x: clamp(x, -(ISLAND.hx - 2), ISLAND.hx - 2),
  z: clamp(z, -(ISLAND.hz - 2), ISLAND.hz - 2),
});

export const damp = (current: number, goal: number, lambda: number, dt: number) =>
  Number.isFinite(lambda) ? goal + (current - goal) * Math.exp(-lambda * dt) : goal;

export const zoomFor = (view: number, heightPx: number) => heightPx / view;

export const wheelZoom = (view: number, deltaY: number) =>
  clampView(view * Math.exp(deltaY * 0.0015));

export const panDelta = (dxPx: number, dyPx: number, view: number, heightPx: number) => {
  const perPx = view / heightPx;
  return toGround(screen(dxPx * perPx, -dyPx * perPx));
};

export const frameFor = (map: { x: number; z: number; zoom: number }, narrow: boolean) => {
  if (!narrow) return { x: map.x, z: map.z, view: map.zoom };
  const down = panDelta(0, 1, 1, 1);
  const length = Math.hypot(down.x, down.z);
  const shift = map.zoom * 0.22;
  return {
    x: map.x + (down.x / length) * shift,
    z: map.z + (down.z / length) * shift,
    view: map.zoom,
  };
};

export const viewPolygon = (x: number, z: number, view: number, aspect: number) => {
  const halfH = view / 2;
  const halfW = halfH * aspect;
  return [
    [-1, 1],
    [1, 1],
    [1, -1],
    [-1, -1],
  ].map(([sx, sy]) => {
    const g = toGround(screen(sx * halfW, sy * halfH));
    return { x: x + g.x, z: z + g.z };
  });
};
