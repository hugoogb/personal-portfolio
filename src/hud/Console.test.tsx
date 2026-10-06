// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { Console } from "@/hud/Console";
import { useBaseCamp } from "@/store/store";

beforeEach(() => useBaseCamp.setState({ ...useBaseCamp.getInitialState(), consoleOpen: true }));

describe("Console", () => {
  it("filters as you type and runs the highlighted command on Enter", () => {
    render(<Console />);
    const input = screen.getByRole("combobox");
    expect(document.activeElement).toBe(input);
    fireEvent.change(input, { target: { value: "go read" } });
    expect(screen.getAllByRole("option").map((o) => o.textContent)).toEqual(["go readledger"]);
    fireEvent.keyDown(input, { key: "Enter" });
    expect(useBaseCamp.getState().selected).toBe("rl");
    expect(useBaseCamp.getState().consoleOpen).toBe(false);
  });

  it("moves the highlight with the arrow keys", () => {
    render(<Console />);
    const input = screen.getByRole("combobox");
    fireEvent.change(input, { target: { value: "go" } });
    fireEvent.keyDown(input, { key: "ArrowDown" });
    expect(screen.getAllByRole("option")[1].getAttribute("aria-selected")).toBe("true");
    fireEvent.keyDown(input, { key: "Enter" });
    expect(useBaseCamp.getState().selected).toBe("f1");
  });

  it("says so when nothing matches", () => {
    render(<Console />);
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "zzz" } });
    expect(screen.getByText("No matching command")).toBeTruthy();
  });
});
