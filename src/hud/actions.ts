import { TIER_NAMES } from "@/boot/tiers";
import { CONTACT } from "@/constants/strings.constants";
import type { Place } from "@/content/types";
import type { Command } from "@/hud/commands";
import { useBaseCamp } from "@/store/store";
import { trackBrief, trackOutbound, type BriefSource } from "@/utils/track";
import { OVERVIEW } from "@/world/lib/map";

/** Opens the prerendered Brief over the town (Boot sets html.brief-open), optionally at a section. */
export const openBrief = (anchor: string | null = null, source: BriefSource = "button") => {
  // Already open (a deep link or card while reading): still scroll, but it is not a new open.
  if (!useBaseCamp.getState().briefOpen) trackBrief(source);
  useBaseCamp.getState().setBriefOpen(true);
  // Boot applies html.brief-open in an effect; wait for it so we never scroll a hidden Brief.
  let frames = 0;
  const reveal = () => {
    if (!document.documentElement.classList.contains("brief-open") && ++frames < 10) {
      requestAnimationFrame(reveal);
      return;
    }
    const brief = document.getElementById("brief");
    if (!brief) return;
    brief.setAttribute("tabindex", "-1");
    const target = anchor ? document.getElementById(anchor) : brief;
    target?.scrollIntoView?.({ block: "start" });
    brief.focus({ preventScroll: true });
  };
  requestAnimationFrame(reveal);
};

export const closeBrief = () => {
  useBaseCamp.getState().setBriefOpen(false);
  // The stage is inert until the next render; focus once it is live again.
  requestAnimationFrame(() => document.querySelector<HTMLElement>("[data-brief-toggle]")?.focus());
};

export const toggleBrief = (source: BriefSource) =>
  useBaseCamp.getState().briefOpen ? closeBrief() : openBrief(null, source);

/** Keyboard shortcuts open links here; card clicks use real <a> tags tracked by ClientRoot. */
export const openLink = (href: string, label: string) => {
  trackOutbound(href, label);
  window.open(href, "_blank", "noopener");
};

export const copyEmail = async () => {
  try {
    await navigator.clipboard.writeText(CONTACT.EMAIL);
    useBaseCamp.getState().toast(`Copied ${CONTACT.EMAIL}`);
  } catch {
    window.location.href = `mailto:${CONTACT.EMAIL}`;
  }
};

export const runPrimary = (place: Place) => {
  const s = useBaseCamp.getState();
  if (place.primary.href) return openLink(place.primary.href, place.name);
  switch (place.primary.action) {
    case "brief":
      return openBrief(null, "card");
    case "overview":
      return s.focus(OVERVIEW.x, OVERVIEW.z, OVERVIEW.view);
    case "wave":
      s.startWave();
      return s.toast("Wave started in the stands");
    case "drive":
      return s.setDriving(true);
    case "copyEmail":
      return void copyEmail();
  }
};

export const runSecondary = (place: Place) => {
  if (place.secondary) openLink(place.secondary.href, `${place.name} ${place.secondary.label}`);
};

export const runTertiary = (place: Place) => {
  if (place.stack.length > 0) return useBaseCamp.getState().toggleStack();
  if (place.tertiary) openLink(place.tertiary.href, `${place.name} ${place.tertiary.label}`);
};

/** The GPU's name from the canvas's existing WebGL context; never throws. */
export const gpuRenderer = (): string => {
  try {
    const canvas = document.querySelector<HTMLCanvasElement>(".stage canvas");
    const gl = (canvas?.getContext("webgl2") ?? canvas?.getContext("webgl")) as
      | WebGL2RenderingContext
      | WebGLRenderingContext
      | null
      | undefined;
    // The plain parameter first (no Firefox deprecation warning); browsers that mask it as a
    // generic "WebKit WebGL" still name the GPU through the debug extension.
    const plain = gl?.getParameter(gl.RENDERER);
    if (typeof plain === "string" && plain && !/^(webkit webgl|mozilla)$/i.test(plain))
      return plain;
    const info = gl?.getExtension("WEBGL_debug_renderer_info");
    const name = info ? gl?.getParameter(info.UNMASKED_RENDERER_WEBGL) : null;
    return typeof name === "string" && name ? name : "unknown GPU";
  } catch {
    return "unknown GPU";
  }
};

export const runCommand = (command: Command) => {
  const s = useBaseCamp.getState();
  s.setConsoleOpen(false);
  switch (command.run.type) {
    case "go":
      return s.select(command.run.id);
    case "drive":
      s.select("arena");
      return s.setDriving(true);
    case "brief":
      return openBrief(null, "console");
    case "copyEmail":
      return void copyEmail();
    case "time":
      return s.setTimeOverride(command.run.hour);
    case "stats":
      return s.toast(`${TIER_NAMES[s.tier]} · ${s.fps || "-"} fps · ${gpuRenderer()}`);
  }
};
