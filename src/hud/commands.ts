import { PLACES, PLACE_BY_ID } from "@/content/places";
import type { PlaceId } from "@/content/types";

export type CommandRun =
  | { type: "go"; id: PlaceId }
  | { type: "drive" }
  | { type: "brief" }
  | { type: "copyEmail" }
  | { type: "time"; hour: number | null }
  | { type: "stats" };

export interface Command {
  id: string;
  label: string;
  run: CommandRun;
}

/** The console's commands (spec 4.3). */
export const COMMANDS: Command[] = [
  ...PLACES.map((p) => ({
    id: `go-${p.slug}`,
    label: `go ${p.name.toLowerCase()}`,
    run: { type: "go", id: p.id } as CommandRun,
  })),
  { id: "drive", label: "drive", run: { type: "drive" } },
  { id: "brief", label: "brief", run: { type: "brief" } },
  { id: "copy-email", label: "copy email", run: { type: "copyEmail" } },
  { id: "stats", label: "stats", run: { type: "stats" } },
];

const TIME_COMMANDS: Command[] = [
  { id: "night", label: "night", run: { type: "time", hour: 23 } },
  { id: "day", label: "day", run: { type: "time", hour: 13 } },
  { id: "live", label: "live", run: { type: "time", hour: null } },
];

/** "night" and "day" exist to check the lighting; they are not offered on the live site (spec 4.3). */
export const commandsFor = (preview: boolean): Command[] =>
  preview ? [...COMMANDS, ...TIME_COMMANDS] : COMMANDS;

export const isPreview = () =>
  import.meta.env.DEV || !/(^|\.)hugoogb\.dev$/.test(window.location.hostname);

/** Every word must appear in the label or, for a go command, in the place's slug. */
export const filterCommands = (query: string, list: Command[] = COMMANDS) => {
  const words = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  if (!words.length) return list;
  return list.filter((c) => {
    const haystack = c.run.type === "go" ? `${c.label} ${PLACE_BY_ID[c.run.id].slug}` : c.label;
    return words.every((w) => haystack.includes(w));
  });
};
