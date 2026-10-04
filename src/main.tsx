import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./App";
// Self-hosted rather than linked from Google Fonts: a third-party stylesheet
// blocks first paint behind two extra connections, and these ship in our CSS.
import "@fontsource-variable/hanken-grotesk";
import "@fontsource-variable/raleway";
import "@fontsource/ibm-plex-mono/400.css";
import "@/styles/globals.css";

const container = document.getElementById("root")!;
const app = (
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Production HTML arrives already rendered (scripts/prerender.mjs), so React
// adopts it instead of rebuilding it. The dev server serves the empty shell.
if (container.firstElementChild) {
  ReactDOM.hydrateRoot(container, app);
} else {
  ReactDOM.createRoot(container).render(app);
}
