// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { Settings } from "@/hud/Settings";
import { useBaseCamp } from "@/store/store";

beforeEach(() => useBaseCamp.setState(useBaseCamp.getInitialState()));

describe("Settings", () => {
  it("paints a preset accent", () => {
    render(<Settings />);
    fireEvent.click(screen.getByRole("button", { name: "Emerald" }));
    expect(useBaseCamp.getState().accent).toBe("#10b981");
    expect(document.documentElement.style.getPropertyValue("--primary-color")).toBe("#10b981");
    expect(screen.getByRole("button", { name: "Emerald" }).getAttribute("aria-pressed")).toBe(
      "true",
    );
  });

  it("sets the quality, which sets the tier", () => {
    useBaseCamp.getState().setAutoTier(3);
    render(<Settings />);
    fireEvent.click(screen.getByRole("radio", { name: "Low" }));
    expect(useBaseCamp.getState().qualityMode).toBe("Low");
    expect(useBaseCamp.getState().tier).toBe(1);
    expect(screen.getByText(/Low · \d+ fps/)).toBeTruthy();
  });

  it("pins the HUD theme and closes", () => {
    useBaseCamp.setState({ panel: "settings" });
    render(<Settings />);
    fireEvent.click(screen.getByRole("radio", { name: "Dark" }));
    expect(useBaseCamp.getState().hudMode).toBe("dark");
    fireEvent.click(screen.getByRole("button", { name: "Close settings" }));
    expect(useBaseCamp.getState().panel).toBeNull();
  });
});
