import { TIER_NAMES } from "@/boot/tiers";
import { CONTACT } from "@/constants/strings.constants";
import type { Place } from "@/content/types";
import type { Command } from "@/hud/commands";
import { enterStory, enterText } from "@/story/transitions";
import { useBaseCamp } from "@/store/store";
import { OVERVIEW } from "@/world/lib/map";

/** Keyboard shortcuts open links here; card clicks use real <a> tags. */
export const openLink = (href: string) => {
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
  if (place.primary.href) return openLink(place.primary.href);
  switch (place.primary.action) {
    case "story":
      return enterStory();
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
  if (place.secondary) openLink(place.secondary.href);
};

export const runTertiary = (place: Place) => {
  if (place.stack.length > 0) return useBaseCamp.getState().toggleStack();
  if (place.tertiary) openLink(place.tertiary.href);
};

/** The GPU's name from the canvas's existing WebGL context; never throws. */
export const gpuRenderer = (): string => {
  try {
    const canvas = document.querySelector<HTMLCanvasElement>("#town-root canvas");
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
    case "mode":
      return command.run.mode === "story" ? enterStory() : enterText();
    case "copyEmail":
      return void copyEmail();
    case "time":
      return s.setTimeOverride(command.run.hour);
    case "stats":
      return s.toast(`${TIER_NAMES[s.tier]} · ${s.fps || "-"} fps · ${gpuRenderer()}`);
  }
};
