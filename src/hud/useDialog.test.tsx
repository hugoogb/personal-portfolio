// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it } from "vitest";
import { useDialog } from "@/hud/useDialog";

function Dialog() {
  const ref = useDialog<HTMLDivElement>();
  return (
    <div ref={ref} role="dialog">
      <button type="button">first</button>
      <button type="button">last</button>
    </div>
  );
}

function RadioDialog() {
  const ref = useDialog<HTMLDivElement>();
  return (
    <div ref={ref} role="dialog">
      <button type="button">first</button>
      <input type="radio" name="mode" aria-label="auto" defaultChecked />
      <input type="radio" name="mode" aria-label="dark" />
    </div>
  );
}

function Host() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen((o) => !o)}>
        toggle
      </button>
      {open && <Dialog />}
    </>
  );
}

describe("useDialog", () => {
  it("focuses the first control, traps Tab, and gives focus back", () => {
    render(<Host />);
    const toggle = screen.getByRole("button", { name: "toggle" });
    toggle.focus();
    fireEvent.click(toggle);
    const first = screen.getByRole("button", { name: "first" });
    const last = screen.getByRole("button", { name: "last" });
    expect(document.activeElement).toBe(first);
    last.focus();
    fireEvent.keyDown(last, { key: "Tab" });
    expect(document.activeElement).toBe(first);
    fireEvent.keyDown(first, { key: "Tab", shiftKey: true });
    expect(document.activeElement).toBe(last);
    fireEvent.click(toggle);
    expect(document.activeElement).toBe(toggle);
  });

  it("treats a radio group as one stop, its checked radio, when wrapping Tab", () => {
    render(<RadioDialog />);
    const checked = screen.getByRole("radio", { name: "auto" });
    checked.focus();
    fireEvent.keyDown(checked, { key: "Tab" });
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "first" }));
  });
});
