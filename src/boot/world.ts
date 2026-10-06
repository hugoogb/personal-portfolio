/** If the town has not drawn a frame by then, the visitor gets the Brief, not a stuck title card. */
export const READY_TIMEOUT_MS = 15_000;

export const leaveWorld = () =>
  document.documentElement.classList.remove("world", "world-ready", "brief-open");

/** sessionStorage flag: the town failed to draw this session. bootHead reads it as a literal. */
export const TOWN_FAILED_KEY = "bc-town-failed";
