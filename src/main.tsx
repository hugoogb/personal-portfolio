import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
// Self-hosted rather than linked from Google Fonts: a third-party stylesheet
// blocks first paint behind two extra connections, and these ship in our CSS.
// The two story faces, cut to the weights in use (scripts/fonts.py).
import "@/styles/fonts.css";
import "@fontsource/ibm-plex-mono/400.css";
import "@/styles/globals.css";
// The story document is prerendered and never imported by the client, so its
// layout (and the mode switch's) ships here, render-blocking like the page's.
import "@/story/story.css";
import { ClientRoot } from "@/client/ClientRoot";

// Production HTML arrives with the story document already rendered
// (scripts/prerender.mjs) and it is static, so it is never hydrated. The dev
// server serves an empty #root, so render the story document here, and only in
// dev, so it never ships twice.
const root = document.getElementById("root");
if (import.meta.env.DEV && root && !root.firstElementChild) {
  void import("@/story/Story").then(({ Story }) =>
    createRoot(root).render(
      <StrictMode>
        <Story />
      </StrictMode>,
    ),
  );
}

const client = document.getElementById("client-root");
if (client) {
  createRoot(client).render(
    <StrictMode>
      <ClientRoot />
    </StrictMode>,
  );
}
