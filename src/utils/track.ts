import { track } from "@vercel/analytics";

/**
 * Which projects people actually open is the one thing this site cannot tell me
 * from page views alone - every project lives on a different domain, so the
 * click is the last thing measurable from here.
 *
 * `track` is a no-op in development and whenever the analytics script has not
 * loaded, so this needs no guard of its own.
 */
export const trackOutbound = (url: string, label: string) => {
  if (!url) return;
  track("outbound", { url, label });
};
