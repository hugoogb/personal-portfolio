import { CONTACT } from "@/constants/strings.constants";
import type { Place } from "@/content/types";
import type { Command } from "@/hud/commands";
import { useBaseCamp } from "@/store/store";
import { trackOutbound } from "@/utils/track";
import { OVERVIEW } from "@/world/lib/map";

/** Opens the prerendered Brief over the town (Boot sets html.brief-open), optionally at a section. */
export const openBrief = (anchor: string | null = null) => {
  useBaseCamp.getState().setBriefOpen(true);
  requestAnimationFrame(() => {
    const brief = document.getElementById("brief");
    if (!brief) return;
    brief.setAttribute("tabindex", "-1");
    const target = anchor ? document.getElementById(anchor) : brief;
    target?.scrollIntoView?.({ block: "start" });
    brief.focus({ preventScroll: true });
  });
};

export const closeBrief = () => {
  useBaseCamp.getState().setBriefOpen(false);
  document.querySelector<HTMLElement>("[data-brief-toggle]")?.focus();
};

export const toggleBrief = () => (useBaseCamp.getState().briefOpen ? closeBrief() : openBrief());

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
      return openBrief();
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
      return openBrief();
    case "copyEmail":
      return void copyEmail();
  }
};
