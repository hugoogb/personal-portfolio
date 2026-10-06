// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { Trophies } from "@/hud/Trophies";
import { useBaseCamp } from "@/store/store";

beforeEach(() => useBaseCamp.setState(useBaseCamp.getInitialState()));

describe("Trophies", () => {
  it("lists all six and marks the unlocked ones", () => {
    useBaseCamp.setState({ achievements: ["console"] });
    render(<Trophies />);
    expect(screen.getByText("Trophies · 1/6")).toBeTruthy();
    expect(screen.getAllByRole("listitem")).toHaveLength(6);
    expect(screen.getByText("Operator").closest("li")?.className).toContain("is-done");
    expect(screen.getByText("Top corner").closest("li")?.className).not.toContain("is-done");
  });
});
