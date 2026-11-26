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

export type Host = "vps" | "vercel";

export type PlaceAction = "story" | "overview" | "wave" | "drive" | "copyEmail";

export interface PlaceLink {
  label: string;
  href: string;
}

export interface Place {
  id: PlaceId;
  slug: string;
  name: string;
  label?: string;
  kind: string;
  pill: string;
  preLaunch?: boolean;
  desc: string;
  stats: string[];
  stack: string[];
  color: string;
  primary: { label: string; href?: string; action?: PlaceAction };
  secondary?: PlaceLink;
  tertiary?: PlaceLink;
  image?: { src: string; srcSetWebp: string; alt: string };
  closedNote?: string;
  map: { x: number; z: number; r: number; top: number; zoom: number };
}
