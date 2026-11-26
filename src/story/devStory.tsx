import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Story } from "@/story/Story";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Story />
  </StrictMode>,
);
