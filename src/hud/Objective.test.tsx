// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { ORDER } from "@/content/places";
import { Objective } from "@/hud/Objective";
import { useBaseCamp } from "@/store/store";

beforeEach(() => useBaseCamp.setState(useBaseCamp.getInitialState()));

describe("Objective", () => {
  it("shows only on a first visit", () => {
    const { container } = render(<Objective />);
    expect(container.textContent).toBe("");
  });

  it("tracks progress, then points to the Post Office", () => {
    useBaseCamp.setState({ firstVisit: true, discovered: ["hq", "rl"] });
    const { rerender } = render(<Objective />);
    expect(screen.getByText("Discover every place in town")).toBeTruthy();
    expect(screen.getByRole("progressbar").getAttribute("aria-valuenow")).toBe("2");
    useBaseCamp.setState({ discovered: [...ORDER] });
    rerender(<Objective />);
    expect(screen.getByText("Every place found · say hello at the Post Office")).toBeTruthy();
  });
});
