import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
// Self-hosted rather than linked from Google Fonts: a third-party stylesheet
// blocks first paint behind two extra connections, and these ship in our CSS.
import "@fontsource-variable/hanken-grotesk";
import "@fontsource-variable/raleway";
import "@fontsource/ibm-plex-mono/400.css";
import "@/styles/globals.css";
import { ClientRoot } from "@/client/ClientRoot";

// Production HTML arrives with the Brief already rendered (scripts/prerender.mjs)
// and it is static, so it is never hydrated. The dev server serves an empty
// #root, so render the Brief here, and only in dev, so it never ships twice.
const root = document.getElementById("root");
if (import.meta.env.DEV && root && !root.firstElementChild) {
  void Promise.all([import("@/brief/Brief"), import("@/brief/TitleCard")]).then(
    ([{ Brief }, { TitleCard }]) =>
      createRoot(root).render(
        <StrictMode>
          <TitleCard />
          <Brief />
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
