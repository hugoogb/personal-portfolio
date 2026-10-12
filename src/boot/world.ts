/** If the town has not drawn a frame by then, it is turned off and the page stays on the still image. */
export const READY_TIMEOUT_MS = 15_000;

/** sessionStorage flag: the town failed to draw this session. bootHead reads it as a literal. */
export const TOWN_FAILED_KEY = "bc-town-failed";
