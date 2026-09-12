export const config = { runtime: "edge" };

interface Target {
  /** Matches `host` in services.constants.ts, which is how the panel joins them. */
  host: string;
  url: string;
}

const TARGETS: Target[] = [
  { host: "f1-tracker.hugoogb.dev", url: "https://f1-tracker.hugoogb.dev" },
  { host: "readledger.app", url: "https://readledger.app" },
  { host: "avatar-generator.hugoogb.dev", url: "https://avatar-generator.hugoogb.dev" },
];

const TIMEOUT_MS = 5_000;

interface Probe {
  host: string;
  ok: boolean;
  status: number;
  /** Round trip in milliseconds, or null when the request never completed. */
  ms: number | null;
}

const probe = async ({ host, url }: Target): Promise<Probe> => {
  const started = Date.now();
  try {
    const response = await fetch(url, {
      method: "GET",
      redirect: "follow",
      signal: AbortSignal.timeout(TIMEOUT_MS),
      headers: { "user-agent": "hugoogb.dev-status" },
    });
    return { host, ok: response.ok, status: response.status, ms: Date.now() - started };
  } catch {
    return { host, ok: false, status: 0, ms: null };
  }
};

/**
 * The service panel used to show hardcoded "live" labels, because reading the
 * real thing from the browser meant a cross-origin request the F1 API refuses -
 * its preflight returns 400 for every origin.
 *
 * Asking from the server instead sidesteps that entirely: there is no Origin
 * header to reject and no preflight to fail. The response is cached at the edge
 * so the upstream hosts see roughly one probe a minute however much traffic
 * this page gets.
 */
export default async function handler(): Promise<Response> {
  const services = await Promise.all(TARGETS.map(probe));

  return new Response(JSON.stringify({ checkedAt: new Date().toISOString(), services }), {
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "public, s-maxage=60, stale-while-revalidate=300",
    },
  });
}
