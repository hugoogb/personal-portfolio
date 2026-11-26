import type { PlaceId } from "../src/content/types";
import { STATUS_TARGETS } from "../src/content/services";

export const config = { runtime: "edge" };

type Target = (typeof STATUS_TARGETS)[number];

const TIMEOUT_MS = 5_000;

interface Probe {
  id: PlaceId;
  host: string;
  ok: boolean;
  status: number;
  ms: number | null;
}

const request = (url: string, method: "HEAD" | "GET") =>
  fetch(url, {
    method,
    redirect: "follow",
    signal: AbortSignal.timeout(TIMEOUT_MS),
    headers: { "user-agent": "hugoogb.dev-status" },
  });

const timed = async (url: string, method: "HEAD" | "GET") => {
  const started = Date.now();
  const response = await request(url, method);
  return { response, ms: Date.now() - started };
};

const probe = async ({ id, host, url }: Target): Promise<Probe> => {
  const head = await timed(url, "HEAD").catch(() => null);
  if (head && head.response.status !== 405 && head.response.status !== 501) {
    return { id, host, ok: head.response.ok, status: head.response.status, ms: head.ms };
  }

  try {
    const get = await timed(url, "GET");
    return { id, host, ok: get.response.ok, status: get.response.status, ms: get.ms };
  } catch {
    return { id, host, ok: false, status: 0, ms: null };
  }
};

export default async function handler(): Promise<Response> {
  const services = await Promise.all(STATUS_TARGETS.map(probe));

  return new Response(JSON.stringify({ checkedAt: new Date().toISOString(), services }), {
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "public, s-maxage=300, stale-while-revalidate=600",
    },
  });
}
