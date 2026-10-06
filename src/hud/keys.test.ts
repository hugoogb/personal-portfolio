// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { keyAction } from "@/hud/keys";

describe("keyAction", () => {
  it("maps the command keys, in either case", () => {
    expect(keyAction({ key: "ArrowRight" })).toBe("next");
    expect(keyAction({ key: "r" })).toBe("next");
    expect(keyAction({ key: "ArrowLeft" })).toBe("prev");
    expect(keyAction({ key: "Q" })).toBe("primary");
    expect(keyAction({ key: "w" })).toBe("secondary");
    expect(keyAction({ key: "e" })).toBe("tertiary");
    expect(keyAction({ key: "b" })).toBe("brief");
    expect(keyAction({ key: "x" })).toBeNull();
  });

  it("opens the console with Ctrl or Cmd + K, even from a field", () => {
    const input = document.createElement("input");
    expect(keyAction({ key: "k", ctrlKey: true })).toBe("console");
    expect(keyAction({ key: "K", metaKey: true, target: input })).toBe("console");
  });

  it("lets Escape through from a field, and nothing else", () => {
    const input = document.createElement("input");
    const editable = document.createElement("div");
    editable.contentEditable = "true";
    expect(keyAction({ key: "Escape", target: input })).toBe("escape");
    expect(keyAction({ key: "q", target: input })).toBeNull();
    expect(keyAction({ key: "ArrowRight", target: document.createElement("select") })).toBeNull();
    expect(keyAction({ key: "b", target: editable })).toBeNull();
  });

  it("leaves browser shortcuts alone", () => {
    expect(keyAction({ key: "r", metaKey: true })).toBeNull();
    expect(keyAction({ key: "b", ctrlKey: true })).toBeNull();
    expect(keyAction({ key: "q", altKey: true })).toBeNull();
  });
});
