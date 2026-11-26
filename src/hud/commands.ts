import { PLACES, PLACE_BY_ID } from "@/content/places";
import type { PlaceId } from "@/content/types";

export type CommandRun =
  | { type: "go"; id: PlaceId }
  | { type: "drive" }
  | { type: "mode"; mode: "story" | "text" }
  | { type: "copyEmail" }
  | { type: "time"; hour: number | null }
  | { type: "stats" };

export interface Command {
  id: string;
  label: string;
  run: CommandRun;
}

export const COMMANDS: Command[] = [
  ...PLACES.map((p) => ({
    id: `go-${p.slug}`,
    label: `go ${p.name.toLowerCase()}`,
    run: { type: "go", id: p.id } as CommandRun,
  })),
  { id: "drive", label: "drive", run: { type: "drive" } },
  { id: "story", label: "story", run: { type: "mode", mode: "story" } },
  { id: "text", label: "text", run: { type: "mode", mode: "text" } },
  { id: "copy-email", label: "copy email", run: { type: "copyEmail" } },
  { id: "stats", label: "stats", run: { type: "stats" } },
];

const TIME_COMMANDS: Command[] = [
  { id: "night", label: "night", run: { type: "time", hour: 23 } },
  { id: "day", label: "day", run: { type: "time", hour: 13 } },
  { id: "live", label: "live", run: { type: "time", hour: null } },
];

export const commandsFor = (preview: boolean, touchOnly = false): Command[] => {
  const list = preview ? [...COMMANDS, ...TIME_COMMANDS] : COMMANDS;
  return touchOnly ? list.filter((c) => c.run.type !== "drive") : list;
};

export const isPreview = () =>
  import.meta.env.DEV || !/(^|\.)hugoogb\.dev$/.test(window.location.hostname);

export const filterCommands = (query: string, list: Command[] = COMMANDS) => {
  const words = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  if (!words.length) return list;
  return list.filter((c) => {
    const haystack = c.run.type === "go" ? `${c.label} ${PLACE_BY_ID[c.run.id].slug}` : c.label;
    return words.every((w) => haystack.includes(w));
  });
};
