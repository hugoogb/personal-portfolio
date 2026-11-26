export const ISLAND = { hx: 18, hz: 14 } as const;

export interface RoadSegment {
  id: string;
  from: [number, number];
  to: [number, number];
}

export const ROAD_WIDTH = 1;

export const ROADS: RoadSegment[] = [
  { id: "main", from: [-17, 0], to: [17, 0] },
  { id: "avenue", from: [0, -13], to: [0, 7] },
  { id: "promenade", from: [-17, 7], to: [17, 7] },
];

export const roadRect = ({ from: [x1, z1], to: [x2, z2] }: RoadSegment) => ({
  cx: (x1 + x2) / 2,
  cz: (z1 + z2) / 2,
  w: Math.abs(x2 - x1) + ROAD_WIDTH,
  d: Math.abs(z2 - z1) + ROAD_WIDTH,
});

export const HOMES: [number, number][] = [
  [-13.4, 3.5],
  [-10.8, 3.3],
  [10.9, 3.3],
  [13.5, 3.5],
];

export const OVERVIEW = { x: -1.6, z: -5.2, view: 15 } as const;
