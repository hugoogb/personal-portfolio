// Self-hosted rather than linked from Google Fonts: a third-party stylesheet
// blocks first paint behind two extra connections, and these ship in our CSS.
// The two story faces, cut to the weights in use (scripts/fonts.py).
import "@/styles/fonts.css";
import "@fontsource/ibm-plex-mono/400.css";
import "@/styles/globals.css";
// The story document is prerendered and never imported by the client, so its
// layout (and the mode switch's) ships here, render-blocking like the page's.
import "@/story/story.css";
import { startClient } from "@/client/client";

// Production HTML arrives with the story document already rendered
// (scripts/prerender.mjs) and it is static, so it is never hydrated: this
// entry has no React. The dev server serves an empty #root, so render the
// story document there, in dev only, so it never ships.
const root = document.getElementById("root");
if (import.meta.env.DEV && root && !root.firstElementChild) void import("@/story/devStory");

const client = document.getElementById("client-root");
if (client) startClient(client);
