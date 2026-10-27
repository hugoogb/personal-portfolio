import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Town } from "@/boot/Town";

/** The town's React root, loaded by src/client/town.ts once a mode wants the town. */
export const mountTown = (parent: HTMLElement, before: Node | null) => {
  const el = document.createElement("div");
  el.style.display = "contents";
  parent.insertBefore(el, before);
  createRoot(el).render(
    <StrictMode>
      <Town />
    </StrictMode>,
  );
};
