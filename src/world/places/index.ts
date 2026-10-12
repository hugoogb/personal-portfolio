import type * as THREE from "three";
import type { PlaceId } from "@/content/types";
import type { Kit } from "@/world/kit/kit";
import { buildArena } from "@/world/places/arena";
import { buildCircuit } from "@/world/places/circuit";
import { buildDepartures } from "@/world/places/departures";
import { buildFactory } from "@/world/places/factory";
import { buildGift } from "@/world/places/gift";
import { buildHq } from "@/world/places/hq";
import { buildLibrary } from "@/world/places/library";
import { buildPostOffice } from "@/world/places/postOffice";
import { buildRestaurant } from "@/world/places/restaurant";
import { buildStadium } from "@/world/places/stadium";
import { buildYard } from "@/world/places/yard";

export const PLACE_BUILDERS: Record<PlaceId, (kit: Kit) => THREE.Group> = {
  hq: buildHq,
  f1: buildCircuit,
  rl: buildLibrary,
  wt: buildGift,
  es: buildRestaurant,
  av: buildFactory,
  yard: buildYard,
  stadium: buildStadium,
  arena: buildArena,
  board: buildDepartures,
  post: buildPostOffice,
};
