export type PlaceId =
  | "hq"
  | "f1"
  | "rl"
  | "wt"
  | "es"
  | "av"
  | "yard"
  | "stadium"
  | "arena"
  | "board"
  | "post";

export type Zone = "centre" | "industrial" | "outskirts" | "seafront";

/** Where a project actually runs; drives the traffic routes and the yard's racks. */
export type Host = "vps" | "vercel";

/** What a place's primary button does when it is not a plain link. */
export type PlaceAction = "brief" | "overview" | "wave" | "drive" | "copyEmail";

export interface PlaceLink {
  label: string;
  href: string;
}

export interface Place {
  id: PlaceId;
  /** Deep links (`/#readledger`) and the Brief's anchors use this. */
  slug: string;
  zone: Zone;
  name: string;
  /** Short floating label, when the name is too long for one. */
  label?: string;
  kind: string;
  pill: string;
  preLaunch?: boolean;
  desc: string;
  stats: string[];
  stack: string[];
  /** Roof and card-thumb colour. */
  color: string;
  /** Exactly one of `href` or `action` is set. */
  primary: { label: string; href?: string; action?: PlaceAction };
  secondary?: PlaceLink;
  /** The E button becomes this link when a place has no stack to show. */
  tertiary?: PlaceLink;
  /** Card banner and Brief picture, projects only. */
  image?: { src: string; srcSetWebp: string };
  /** Shown instead of a source link when the code is private. */
  closedNote?: string;
  /** World placement: centre, selection-ring radius, label height, camera zoom. */
  map: { x: number; z: number; r: number; top: number; zoom: number };
}
