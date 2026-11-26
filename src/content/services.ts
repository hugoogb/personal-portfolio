import type { Host, PlaceId } from "@/content/types";

export interface Service {
  id: PlaceId;
  host: string;
  hostedOn: Host[];
}

export const SERVICES: Service[] = [
  { id: "hq", host: "hugoogb.dev", hostedOn: ["vercel"] },
  { id: "f1", host: "f1-tracker.hugoogb.dev", hostedOn: ["vercel", "vps"] },
  { id: "rl", host: "readledger.app", hostedOn: ["vps"] },
  { id: "wt", host: "wrappedthings.app", hostedOn: ["vercel"] },
  { id: "es", host: "estonoesunrestaurante.com", hostedOn: ["vps"] },
  { id: "av", host: "avatar-generator.hugoogb.dev", hostedOn: ["vercel"] },
];

export const STATUS_TARGETS = SERVICES.filter((s) => s.id !== "hq").map((s) => ({
  id: s.id,
  host: s.host,
  url: `https://${s.host}`,
}));

export const appsOn = (host: Host): PlaceId[] =>
  SERVICES.filter((s) => s.hostedOn.includes(host)).map((s) => s.id);
