import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Story } from "@/story/Story";

// Dev only (main.ts): the dev server has no prerendered document.
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Story />
  </StrictMode>,
);
