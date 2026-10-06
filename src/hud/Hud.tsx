import type { ReactNode } from "react";

/** Replaced in Task 7. */
export function Hud({ world }: { world: ReactNode }) {
  return <div className="stage">{world}</div>;
}
