import "@/styles/fonts.css";
import "@fontsource/ibm-plex-mono/400.css";
import "@/styles/globals.css";
import "@/story/story.css";
import { startClient } from "@/client/client";

const root = document.getElementById("root");
if (import.meta.env.DEV && root && !root.firstElementChild) void import("@/story/devStory");

const client = document.getElementById("client-root");
if (client) startClient(client);
