import { describe, expect, it } from "vitest";
import { PLACES } from "@/content/places";
import { COMMANDS, commandsFor, filterCommands } from "@/hud/commands";

describe("commands", () => {
  it("has a go command for every place, plus drive, brief and copy email", () => {
    expect(COMMANDS.filter((c) => c.run.type === "go")).toHaveLength(PLACES.length);
    expect(COMMANDS.map((c) => c.label)).toEqual(
      expect.arrayContaining(["drive", "brief", "copy email", "go readledger", "go post office"]),
    );
  });

  it("lists everything for an empty query", () => {
    expect(filterCommands("  ")).toEqual(COMMANDS);
  });

  it("matches every word, by label or by place slug", () => {
    expect(filterCommands("go read").map((c) => c.label)).toEqual(["go readledger"]);
    expect(filterCommands("contact").map((c) => c.label)).toEqual(["go post office"]);
    expect(filterCommands("COPY")).toHaveLength(1);
    expect(filterCommands("nothing here")).toEqual([]);
  });
});

describe("time commands", () => {
  it("are only offered in development and previews", () => {
    expect(commandsFor(false).some((c) => c.run.type === "time")).toBe(false);
    const times = commandsFor(true)
      .filter((c) => c.run.type === "time")
      .map((c) => c.label);
    expect(times).toEqual(["night", "day", "live"]);
  });
});
